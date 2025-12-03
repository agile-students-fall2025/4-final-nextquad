const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    timestamp: { type: String }, // ex: "2h ago" (derived)
    createdAt: { type: Number }, // epoch ms from mock data
    category: { type: String },
    likes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    image: { type: String, default: null }, // Deprecated - keeping for backward compatibility
    images: { type: [String], default: [] }, // New: Array of image URLs/base64
    author: {
      name: String,
      avatar: String,
      userId: String,
    },
    isLikedByUser: { type: Boolean, default: false }, // mostly frontend concern
    updatedAt: { type: Date },
    resolved: { type: Boolean, default: false },
    editCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
