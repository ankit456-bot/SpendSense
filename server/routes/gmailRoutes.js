const express = require("express");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PENDING ORDER MODEL
// ==========================================

const pendingOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gmailMessageId: {
      type: String,
      required: true,
    },
    merchant: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      default: "Shopping",
    },
    date: {
      type: Date,
      required: true,
    },
    subject: String,
    from: String,
    snippet: String,
    status: {
      type: String,
      enum: ["pending", "approved", "ignored"],
      default: "pending",
    },
    expenseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
  },
  { timestamps: true }
);

pendingOrderSchema.index(
  { userId: 1, gmailMessageId: 1 },
  { unique: true }
);

const PendingOrder =
  mongoose.models.PendingOrder ||
  mongoose.model("PendingOrder", pendingOrderSchema);

// ==========================================
// GOOGLE OAUTH
// ==========================================

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
];

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ==========================================
// EMAIL BODY DECODING
// ==========================================

function decodeBase64(data = "") {
  try {
    return Buffer.from(
      data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
  } catch (error) {
    console.error("Email decoding error:", error.message);
    return "";
  }
}

async function getEmailBody(gmail, messageId, payload) {
  if (!payload) return "";

  async function decodePart(part) {
    if (part.body?.data) {
      return decodeBase64(part.body.data);
    }

    if (part.body?.attachmentId) {
      try {
        const attachment =
          await gmail.users.messages.attachments.get({
            userId: "me",
            messageId,
            id: part.body.attachmentId,
          });

        return decodeBase64(attachment.data.data || "");
      } catch (error) {
        console.error(
          "Failed to fetch email attachment:",
          error.message
        );
      }
    }

    return "";
  }

  async function collectParts(part, mimeType) {
    if (!part) return [];

    const matches = [];

    if (part.mimeType === mimeType) {
      const body = await decodePart(part);

      if (body) {
        matches.push(body);
      }
    }

    for (const child of part.parts || []) {
      matches.push(...(await collectParts(child, mimeType)));
    }

    return matches;
  }

  function longestUsefulPart(parts) {
    return parts
      .map((body) => ({
        body,
        usefulLength: cleanEmailText(body).length,
      }))
      .filter((part) => part.usefulLength > 1)
      .sort((a, b) => b.usefulLength - a.usefulLength)[0]
      ?.body || "";
  }

  const plainTextParts = await collectParts(
    payload,
    "text/plain"
  );
  const htmlParts = await collectParts(
    payload,
    "text/html"
  );

  const plainText = longestUsefulPart(plainTextParts);

  // A trivial plain-text MIME part (such as ".") can accompany
  // the real email body in HTML. Prefer HTML when plain text is unusable.
  if (plainText && cleanEmailText(plainText).length > 20) {
    return plainText;
  }

  const htmlText = longestUsefulPart(htmlParts);

  return htmlText || plainText;
}

// ==========================================
// CLEAN EMAIL TEXT
// ==========================================

function cleanEmailText(text = "") {
  return String(text)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:div|p|tr|td|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&#8377;|&#x20b9;/gi, "₹")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([a-f\d]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================
// AMOUNT PARSING
// ==========================================

function parseAmount(text) {
  if (!text) return null;

  const normalized = cleanEmailText(text)
    .replace(/[₹]/g, " ₹ ")
    .replace(/\s+/g, " ");

  const number = String.raw`([\d,]+(?:\.\d{1,2})?)`;

  // Flipkart uses "₨." in this email; accept it as a currency marker.
const currency = String.raw`(?:₹|₨\.?|INR|Rs\.?)?\s*`;
  // Look for the actual order total before trying individual product prices.
  const labeledPatterns = [
    new RegExp(
      String.raw`(?:grand\s+total|order\s+total|total\s+amount|amount\s+paid|paid\s+amount|total\s+paid|payable\s+amount|net\s+paid|you\s+paid|amount\s+payable)\s*[:\-]?\s*${currency}${number}`,
      "i"
    ),

    new RegExp(
      String.raw`(?:total|amount\s+paid|paid)\s*[:\-]?\s*${currency}${number}`,
      "i"
    ),

    new RegExp(
      String.raw`${currency}${number}\s*(?:as\s+)?(?:grand\s+total|order\s+total|total\s+paid|amount\s+paid)`,
      "i"
    ),
  ];

  for (const pattern of labeledPatterns) {
    const match = normalized.match(pattern);

    if (match) {
      const amount = Number(match[1].replace(/,/g, ""));

      if (Number.isFinite(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // Find currency amounts, starting from the end because receipts
  // commonly show the final total last.
const currencyRegex =
  /(?:₹|₨\.?|INR|Rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/gi;

  const matches = [...normalized.matchAll(currencyRegex)];

  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i];
    const amount = Number(match[1].replace(/,/g, ""));

    if (!Number.isFinite(amount) || amount <= 0) {
      continue;
    }

    const before = normalized.slice(
      Math.max(0, match.index - 60),
      match.index
    );

    if (
      /discount|saved|savings|off|cashback|coupon|you save/i.test(
        before
      )
    ) {
      continue;
    }

    return amount;
  }

  // Fallback for emails with no currency symbol.
  const plainTotalRegex =
    /(?:grand\s+total|order\s+total|total\s+amount|amount\s+paid|total\s+paid|payable\s+amount|net\s+paid)\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)/i;

  const plainMatch = normalized.match(plainTotalRegex);

  if (plainMatch) {
    const amount = Number(plainMatch[1].replace(/,/g, ""));

    if (Number.isFinite(amount) && amount > 0) {
      return amount;
    }
  }

  return null;
}

// ==========================================
// DATE PARSING
// ==========================================

function parseOrderDate(text) {
  if (!text) return null;

  const normalized = cleanEmailText(text).replace(/,/g, " ");

  const months = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const patterns = [
    /\b(?:order\s+(?:placed|date|confirmed)(?:\s+on)?|placed\s+on)\s*[:\-]?\s*(\d{1,2})\s+([a-z]{3,9})\s+(\d{4})/i,
    /\b(?:order\s+(?:placed|date|confirmed)(?:\s+on)?|placed\s+on)\s*[:\-]?\s*([a-z]{3,9})\s+(\d{1,2})\s+(\d{4})/i,
    /\b(\d{1,2})\s+([a-z]{3,9})\s+(\d{4})\b/i,
    /\b([a-z]{3,9})\s+(\d{1,2})\s+(\d{4})\b/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);

    if (!match) continue;

    let day;
    let monthName;
    let year;

    if (/^[a-z]/i.test(match[1])) {
      monthName = match[1].toLowerCase();
      day = Number(match[2]);
      year = Number(match[3]);
    } else {
      day = Number(match[1]);
      monthName = match[2].toLowerCase();
      year = Number(match[3]);
    }

    const month = months[monthName];

    if (month === undefined) continue;

    const date = new Date(year, month, day);

    if (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  return null;
}

// ==========================================
// AMAZON / FLIPKART ORDER PARSER
// ==========================================

function extractOrderData(body, subject, from, headerDate) {
  const cleanBody = cleanEmailText(body);
  const cleanSubject = cleanEmailText(subject);
  const text = `${cleanSubject} ${cleanBody}`;
  const sender = String(from || "").toLowerCase();

  let merchant = null;

  if (/amazon\.(?:in|com)/i.test(`${sender} ${text}`)) {
    merchant = "Amazon";
  } else if (/flipkart/i.test(`${sender} ${text}`)) {
    merchant = "Flipkart";
  }

  if (!merchant) return null;

  // Ignore cancellations, refunds, returns and delivery updates.
  if (
    /cancelled|canceled|refund initiated|refund processed|return requested|return completed|return picked up|item has been delivered|order delivered/i.test(
      cleanSubject
    )
  ) {
    return null;
  }

  // Require an order-related subject.
  if (
    !/order|placed|confirmed|successfully placed|order details/i.test(
      cleanSubject
    )
  ) {
    return null;
  }

  let title = cleanSubject
    .replace(/^(amazon|flipkart)\s*[:\-]\s*/i, "")
    .trim();

  const productMatch = cleanSubject.match(
    /(?:order for|ordered|item)\s+(.+?)(?:\s+has been|\s+is confirmed|\s+is placed|$)/i
  );

  if (productMatch?.[1]) {
    title = productMatch[1].trim();
  }

  const itemMatch = cleanBody.match(
    /(?:item name|product name|item description)\s*[:\-]\s*(.{3,150}?)(?=\s+(?:quantity|qty|price|order id|seller|delivery)|$)/i
  );

  if (itemMatch?.[1]) {
    title = itemMatch[1].trim();
  }

  if (!title) {
    title = `${merchant} order`;
  }

  const amount =
    parseAmount(cleanBody) ??
    parseAmount(cleanSubject);

  let date =
    parseOrderDate(cleanBody) ||
    parseOrderDate(cleanSubject);

  // Use Gmail header date if the order date cannot be extracted from the body.
  if (!date && headerDate) {
    const parsedHeaderDate = new Date(headerDate);

    if (!Number.isNaN(parsedHeaderDate.getTime())) {
      date = parsedHeaderDate;
    }
  }

  return {
    merchant,
    title,
    amount,
    date,
    category: "Shopping",
  };
}

// ==========================================
// START GMAIL AUTHORIZATION
// GET /api/gmail/auth
// ==========================================

router.get("/auth", authMiddleware, (req, res) => {
  try {
    const state = jwt.sign(
      { userId: req.user.userId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const authUrl = createOAuthClient().generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      include_granted_scopes: true,
      prompt: "consent",
      state,
    });

    res.json({ authUrl });
  } catch (error) {
    console.error("Gmail auth error:", error.message);

    res.status(500).json({
      message: "Could not start Gmail authorization",
    });
  }
});

// ==========================================
// GOOGLE OAUTH CALLBACK
// GET /api/gmail/callback
// ==========================================

router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send(
        "Missing authorization code or state"
      );
    }

    const decoded = jwt.verify(state, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).send("SpendSense user not found");
    }

    const oauth2Client = createOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      user.gmailRefreshToken = tokens.refresh_token;
    }

    user.gmailConnected = true;
    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error(
      "Google OAuth error:",
      error.response?.data || error.message
    );

    res.status(500).send("Gmail connection failed");
  }
});

// ==========================================
// GET GMAIL CLIENT
// ==========================================

async function getGmailClient(userId) {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (!user.gmailRefreshToken) {
    const error = new Error("Gmail is not connected");
    error.status = 400;
    throw error;
  }

  const oauth2Client = createOAuthClient();

  oauth2Client.setCredentials({
    refresh_token: user.gmailRefreshToken,
  });

  return {
    user,
    gmail: google.gmail({
      version: "v1",
      auth: oauth2Client,
    }),
  };
}

// ==========================================
// SYNC GMAIL ORDERS
// GET /api/gmail/messages
// ==========================================

router.get("/messages", authMiddleware, async (req, res) => {
  try {
    const { user, gmail } = await getGmailClient(req.user.userId);

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      q: "newer_than:90d {from:amazon.in from:amazon.com from:flipkart.com from:flipkart.in}",
    });

    const messages = response.data.messages || [];
    const emailData = [];

    for (const message of messages) {
      try {
        const email = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const headers = email.data.payload?.headers || [];

        const getHeader = (name) =>
          headers.find(
            (header) =>
              header.name.toLowerCase() === name.toLowerCase()
          )?.value || "";

        const subject = getHeader("subject");
        const from = getHeader("from");
        const headerDate = getHeader("date");

        const rawBody = await getEmailBody(
          gmail,
          message.id,
          email.data.payload
        );

        const body = cleanEmailText(rawBody);
        const transaction = extractOrderData(
          body,
          subject,
          from,
          headerDate
        );

        if (!transaction) continue;

        let pendingOrder = null;

        if (
          transaction.amount !== null &&
          Number.isFinite(transaction.amount) &&
          transaction.amount > 0 &&
          transaction.date &&
          transaction.title
        ) {
          pendingOrder = await PendingOrder.findOneAndUpdate(
            {
              userId: user._id,
              gmailMessageId: message.id,
            },
            {
              $setOnInsert: {
                userId: user._id,
                gmailMessageId: message.id,
                merchant: transaction.merchant,
                title: transaction.title,
                amount: transaction.amount,
                category: transaction.category,
                date: transaction.date,
                subject,
                from,
                snippet: email.data.snippet || "",
                status: "pending",
              },
            },
            {
              new: true,
              upsert: true,
              setDefaultsOnInsert: true,
            }
          );
        }

        if (!pendingOrder) {
          console.log("Gmail order not added:", {
            subject,
            merchant: transaction.merchant,
            amount: transaction.amount,
            date: transaction.date,
            bodyPreview: body.slice(0, 500),
          });
        }

        emailData.push({
          id: message.id,
          subject,
          from,
          date: headerDate,
          snippet: email.data.snippet || "",
          transaction,
          pendingOrder,
        });
      } catch (messageError) {
        console.error(
          "Failed to process Gmail message:",
          message.id,
          messageError.message
        );
      }
    }

    const pendingCount = await PendingOrder.countDocuments({
      userId: user._id,
      status: "pending",
    });

    res.status(200).json({
      count: emailData.length,
      pendingCount,
      messages: emailData,
    });
  } catch (error) {
    console.error(
      "Gmail messages error:",
      error.response?.data || error.message
    );

    res.status(error.status || 500).json({
      message: error.message || "Failed to read Gmail messages",
    });
  }
});

// ==========================================
// GET PENDING ORDERS
// GET /api/gmail/pending
// ==========================================

router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const orders = await PendingOrder.find({
      userId: req.user.userId,
      status: "pending",
    }).sort({ date: -1 });

    res.json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Pending orders error:", error.message);

    res.status(500).json({
      message: "Failed to fetch pending orders",
    });
  }
});

// ==========================================
// APPROVE ORDER
// POST /api/gmail/approve/:orderId
// ==========================================

router.post(
  "/approve/:orderId",
  authMiddleware,
  async (req, res) => {
    try {
      const order = await PendingOrder.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        return res.status(404).json({
          message: "Pending order not found",
        });
      }

      if (order.status === "ignored") {
        return res.status(400).json({
          message: "This order was ignored",
        });
      }

      if (order.status === "approved") {
        const existing = order.expenseId
          ? await Expense.findOne({
              _id: order.expenseId,
              userId: req.user.userId,
            })
          : await Expense.findOne({
              userId: req.user.userId,
              gmailMessageId: order.gmailMessageId,
            });

        return res.json({
          message: "Order was already approved",
          expense: existing,
        });
      }

      let expense = await Expense.findOne({
        userId: req.user.userId,
        gmailMessageId: order.gmailMessageId,
      });

      if (!expense) {
        expense = await Expense.create({
          userId: req.user.userId,
          title: order.title,
          amount: order.amount,
          category: order.category,
          date: order.date,
          source: "gmail",
          gmailMessageId: order.gmailMessageId,
        });
      }

      order.status = "approved";
      order.expenseId = expense._id;

      await order.save();

      res.json({
        message: "Order approved and expense created",
        expense,
      });
    } catch (error) {
      console.error("Approve order error:", error.message);

      res.status(500).json({
        message: error.message || "Failed to approve order",
      });
    }
  }
);

// ==========================================
// IGNORE ORDER
// POST /api/gmail/ignore/:orderId
// ==========================================

router.post(
  "/ignore/:orderId",
  authMiddleware,
  async (req, res) => {
    try {
      const order = await PendingOrder.findOne({
        _id: req.params.orderId,
        userId: req.user.userId,
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.status === "approved") {
        return res.status(400).json({
          message: "An approved order cannot be ignored",
        });
      }

      order.status = "ignored";
      await order.save();

      res.json({
        message: "Order ignored successfully",
        order,
      });
    } catch (error) {
      console.error("Ignore order error:", error.message);

      res.status(500).json({
        message: "Failed to ignore order",
      });
    }
  }
);

module.exports = router;