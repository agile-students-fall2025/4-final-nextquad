const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    id: { type: Number, index: true },
    postId: { type: Number, required: true, index: true },
    text: { type: String, required: true },
    timestamp: { type: String }, // ex: "2h ago" (derived)
    createdAt: { type: Number }, // epoch ms
    likes: { type: Number, default: 0 },
    author: {
      name: String,
      avatar: String,
      userId: String,
    },
    isLikedByUser: { type: Boolean, default: false },
    editCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", CommentSchema);
