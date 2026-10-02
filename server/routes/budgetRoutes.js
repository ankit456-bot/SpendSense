const express = require("express");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADD / CREATE BUDGET
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    const budget = await Budget.create({
      userId: req.user.userId,
      amount,
      month,
      year
    });

    res.status(201).json({
      message: "Budget created successfully",
      budget
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// GET ALL BUDGETS
// ==========================================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.user.userId
    }).sort({
      year: -1,
      month: -1
    });

    res.status(200).json(budgets);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// UPDATE BUDGET
// ==========================================

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { amount, month, year } = req.body;

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        amount,
        month,
        year
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    res.status(200).json({
      message: "Budget updated successfully",
      budget
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// DELETE BUDGET
// ==========================================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found"
      });
    }

    res.status(200).json({
      message: "Budget deleted successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;