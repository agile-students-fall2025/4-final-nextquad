const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: [String], default: [] },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String },
    image: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
