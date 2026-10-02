const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
  type: String,
  required: false
},
googleId: {
  type: String,
  default: null
},

  // Gmail OAuth
  gmailRefreshToken: {
    type: String,
    default: null
  },

  gmailConnected: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;