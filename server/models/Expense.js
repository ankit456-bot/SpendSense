const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  source: {
    type: String,
    enum: ["manual", "gmail"],
    default: "manual"
  },

  gmailMessageId: {
    type: String,
    default: null
  }

});

const Expense = mongoose.model(
  "Expense",
  expenseSchema
);

module.exports = Expense;