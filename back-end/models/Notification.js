const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    recipientId: { type: String, required: true },
    senderId: { type: String, required: false },
    postId: { type: Number },
    commentId: { type: Number },
    type: {
      type: String,
      enum: [
        'post_comment',
        'post_like',
        'comment_like',
        'thread_reply',
        'post_resolved_status',
        'new_post_in_category',
        "emergency_alert"
      ],
      required: true
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);