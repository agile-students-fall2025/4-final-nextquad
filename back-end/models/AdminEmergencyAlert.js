const mongoose = require("mongoose");

const AdminEmergencyAlertSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    message: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminEmergencyAlert", AdminEmergencyAlertSchema);
