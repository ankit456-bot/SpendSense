
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==========================================
// SIGNUP
// ==========================================

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// ==========================================
// EMAIL/PASSWORD LOGIN
// ==========================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

// ==========================================
// GOOGLE LOGIN
// ==========================================

router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required"
      });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email_verified) {
      return res.status(401).json({
        message: "Google email is not verified"
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || "SpendSense User";

    // Find user by Google ID or verified email
    let user = await User.findOne({
      $or: [
        { googleId },
        { email }
      ]
    });

    if (user) {
      // Link Google account to an existing verified email account
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create a new Google user
      user = await User.create({
        name,
        email,
        googleId,
        password: undefined
      });
    }

    // Generate SpendSense JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.log("Google login error:", error.message);

    res.status(401).json({
      message: "Google authentication failed"
    });
  }
});

module.exports = router;