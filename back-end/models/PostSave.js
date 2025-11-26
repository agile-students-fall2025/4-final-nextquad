const mongoose = require('mongoose');

const PostSaveSchema = new mongoose.Schema(
  {
    postId: { type: Number, required: true },
    userId: { type: String, required: true }
  },
  { timestamps: true }
);

PostSaveSchema.index({ postId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('PostSave', PostSaveSchema);
