const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADD EXPENSE
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date
    } = req.body;

    const expense = await Expense.create({
      userId: req.user.userId,
      title,
      amount,
      category,
      date
    });

    res.status(201).json({
      message: "Expense added successfully",
      expense
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// GET ALL EXPENSES
// ==========================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const expenses = await Expense.find({
        userId: req.user.userId
      }).sort({ date: -1 });

      res.status(200).json(expenses);

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// ==========================================
// UPDATE EXPENSE
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        amount,
        category,
        date
      } = req.body;

      const expense =
        await Expense.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user.userId
          },
          {
            title,
            amount,
            category,
            date
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found"
        });
      }

      res.status(200).json({
        message: "Expense updated successfully",
        expense
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// ==========================================
// DELETE EXPENSE
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const expense =
        await Expense.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.userId
        });

      if (!expense) {
        return res.status(404).json({
          message: "Expense not found"
        });
      }

      res.status(200).json({
        message: "Expense deleted successfully"
      });

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


module.exports = router;