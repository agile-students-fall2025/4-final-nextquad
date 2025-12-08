const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notification/notificationController');

// get all notifications for a specific user
router.get('/:userId', notificationController.getNotifications);

// create a new notification
router.post('/', notificationController.createNotification);

// mark a notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;