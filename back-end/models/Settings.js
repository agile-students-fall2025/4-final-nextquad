const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    darkMode: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
