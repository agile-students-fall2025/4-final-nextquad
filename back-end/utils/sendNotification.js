const Notification = require('../models/Notification');

/**
 * Create a notification and save to DB
 * @param {Object} options
 * @param {String} options.recipientId - The user who will receive the notification
 * @param {String} [options.senderId] - The user who triggered the notification
 * @param {String} [options.postId] - Related post ID (optional)
 * @param {String} [options.commentId] - Related comment ID (optional)
 * @param {String} options.type - Type of notification (must match enum in schema)
 * @param {String} options.message - Message to display in the notification
 */
const sendNotification = async ({
  recipientId,
  senderId,
  postId,
  commentId,
  type,
  message
}) => {
  try {
    if (!recipientId || !type || !message) {
        console.error('❌ Missing Fields:', { recipientId, type, message });
        throw new Error('Missing required fields for notification.');
    }

    const notification = new Notification({
      recipientId,
      senderId,
      postId,
      commentId,
      type,
      message
    });

    await notification.save();
    console.log('✅ Notification created:', message);
  } catch (error) {
    console.error('❌ Failed to create notification:', error.message);
  }
};

module.exports = sendNotification;