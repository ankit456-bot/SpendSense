const express = require("express");
const Income = require("../models/Income");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// ADD INCOME
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      source,
      amount,
      date
    } = req.body;

    const income = await Income.create({
      userId: req.user.userId,
      source,
      amount,
      date
    });

    res.status(201).json({
      message: "Income added successfully",
      income
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error"
    });
  }
});


// ==========================================
// GET ALL INCOME
// ==========================================

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const incomes = await Income.find({
        userId: req.user.userId
      }).sort({ date: -1 });

      res.status(200).json(incomes);

    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server error"
      });
    }
  }
);


// ==========================================
// UPDATE INCOME
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        source,
        amount,
        date
      } = req.body;

      const income =
        await Income.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user.userId
          },
          {
            source,
            amount,
            date
          },
          {
            new: true,
            runValidators: true
          }
        );

      if (!income) {
        return res.status(404).json({
          message: "Income not found"
        });
      }

      res.status(200).json({
        message: "Income updated successfully",
        income
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
// DELETE INCOME
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const income =
        await Income.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.userId
        });

      if (!income) {
        return res.status(404).json({
          message: "Income not found"
        });
      }

      res.status(200).json({
        message: "Income deleted successfully"
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