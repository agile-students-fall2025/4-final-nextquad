import React, { useEffect, useState } from 'react';
import NotificationItem from './NotificationItem';
import './NotificationsPage.css';

export default function NotificationsPage({ navigateTo }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [deletingId, setDeletingId] = useState(null); 

  const user = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = user?.id;

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${currentUserId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        showMessage('Failed to load notifications.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) fetchNotifications();
  }, [currentUserId]);

  // Show success/error message
  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };


  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );

      showMessage('Notification marked as read.', 'success');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      showMessage('Failed to mark as read.', 'error');
    }
  };

  // Fade-out → Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      // Trigger fade-out animation
      setDeletingId(notificationId);

      setTimeout(async () => {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`, {
          method: 'DELETE',
        });

        if (!res.ok) throw new Error("Delete failed");

        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );

        showMessage("Notification deleted.", "success");
        setDeletingId(null);
      }, 400);

    } catch (err) {
      console.error("Error deleting notification:", err);
      showMessage("Failed to delete notification.", "error");
      setDeletingId(null);
    }
  };

  return (
    <div className="notifications-page">
      <h2>Notifications</h2>

      {message && (
        <div className={`notification-banner ${messageType}`}>
          {message}
        </div>
      )}

      <div className="notification-list">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="no-notifications">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n._id}
              id={n._id}
              message={n.message}
              timestamp={new Date(n.createdAt).toLocaleString()}
              isRead={n.isRead}
              isDeleting={deletingId === n._id}   
              onClick={() => markAsRead(n._id)}
              onDelete={() => deleteNotification(n._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}