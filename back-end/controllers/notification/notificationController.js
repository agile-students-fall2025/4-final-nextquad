const Notification = require('../../models/Notification');

// create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { recipientId, senderId, postId, commentId, type, message } = req.body;

    if (!recipientId || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const newNotification = new Notification({
      recipientId,
      senderId,
      postId,
      commentId,
      type,
      message,
    });

    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (err) {
    console.error('Error creating notification:', err);
    res.status(500).json({ error: 'Failed to create notification.' });
  }
};

// Get all notifications for a user (latest first)
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error getting notifications:', err);
    res.status(500).json({ error: 'Failed to get notifications.' });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ error: 'Failed to mark notification as read.' });
  }
};

// Delete a notification 
exports.deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;

    const deleted = await Notification.findByIdAndDelete(notificationId);

    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    res.status(200).json({ message: 'Notification deleted successfully.' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
};