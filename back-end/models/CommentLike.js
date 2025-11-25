const mongoose = require('mongoose');

const CommentLikeSchema = new mongoose.Schema(
  {
    commentId: { type: Number, required: true, index: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

CommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CommentLike', CommentLikeSchema);
