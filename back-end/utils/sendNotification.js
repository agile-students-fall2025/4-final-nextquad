const Notification = require('../models/Notification');
const UserSettings = require('../models/UserSettings'); 

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

    // Check user's notification settings
    const userSettings = await UserSettings.findOne({ user: recipientId });

    // If the user has no notification settings → allow sending by default
    if (!userSettings) {
      console.log(`ℹ️ User ${recipientId} has no settings, sending anyway.`);
    }

    // Map type -> setting key
    const typeToSettingKey = {
      comment_like: 'commentReplies',
      comment_reply: 'commentReplies',
      post_like: 'commentReplies',
      new_lostfound_post: 'lostAndFound',
      new_marketplace_post: 'marketplace',
      new_roommate_post: 'roommateRequest',
    };

    const settingKey = typeToSettingKey[type];

    // If this notification corresponds to a toggle and the user has turned it off → don't send
    if (
      userSettings?.notifications &&
      settingKey &&
      userSettings.notifications[settingKey] === false
    ) {
      console.log(`⚠️ User ${recipientId} disabled ${settingKey} notifications.`);
      return;
    }

    // send notification
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