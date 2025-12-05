const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSettingsSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    notifications: {
      all: { type: Boolean, default: false },
      emergencyAlerts: { type: Boolean, default: false },
      roommateRequest: { type: Boolean, default: false },
      commentReplies: { type: Boolean, default: false },
      lostAndFound: { type: Boolean, default: false },
      marketplace: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserSettings", UserSettingsSchema);
