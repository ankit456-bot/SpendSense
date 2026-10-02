require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const budgetRoutes = require("./routes/budgetRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const gmailRoutes = require("./routes/gmailRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ==========================================
// JSON MIDDLEWARE
// ==========================================

app.use(express.json());

// ==========================================
// ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/budgets", budgetRoutes);
// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.send("SpendSense API is running");
});

// ==========================================
// MONGODB
// ==========================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT, () => {
      console.log(
        `Server running on port ${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(
      "MongoDB connection error:",
      error
    );
  });