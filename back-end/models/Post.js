const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    timestamp: { type: String }, // ex: "2h ago" (derived)
    createdAt: { type: Number, index: true }, // epoch ms from mock data - indexed for sorting
    category: { type: String, index: true }, // indexed for filtering
    likes: { type: Number, default: 0, index: true }, // indexed for popular sort
    commentCount: { type: Number, default: 0 },
    image: { type: String, default: null }, // Deprecated - keeping for backward compatibility
    images: { type: [String], default: [] }, // New: Array of image URLs/base64
    author: {
      name: String,
      avatar: String,
      userId: String,
      email: String,
    },
    isLikedByUser: { type: Boolean, default: false }, // mostly frontend concern
    updatedAt: { type: Date },
    resolved: { type: Boolean, default: false },
    editCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for common query patterns
PostSchema.index({ createdAt: -1 }); // For latest sorting
PostSchema.index({ likes: -1, createdAt: -1 }); // For popular sorting
PostSchema.index({ category: 1, createdAt: -1 }); // For category filtering with sorting

module.exports = mongoose.model("Post", PostSchema);
