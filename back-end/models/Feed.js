const mongoose = require("mongoose");

const feedItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String },
    tag: { type: String },
    author: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FeedItem", feedItemSchema);
