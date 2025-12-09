import React, { useState } from 'react';
import './NotificationsPage.css';

export default function NotificationItem({
  message,
  timestamp,
  isRead,
  onClick,
  onDelete,
  type,
  postId,
  navigateTo
}) {
  const [isFading, setIsFading] = useState(false);

  // delete notification
  const handleDelete = (e) => {
    e.stopPropagation(); 
    setIsFading(true);
    setTimeout(() => {
      onDelete();
    }, 400);
  };

  // mark as read
  const handleNotificationClick = () => {
    onClick(); 
  };

  return (
    <div
      className={`notification-item ${isRead ? 'read' : 'unread'} ${isFading ? 'fade-out' : ''} ${type === 'emergency_alert' ? 'emergency' : ''}`}
      onClick={handleNotificationClick}
      role="button"
    >
      <div className="notification-content">
        <div className="notification-message">{message}</div>
        <div className="notification-timestamp">{timestamp}</div>
      </div>

      {postId && (
        <button
          className="notification-jump-btn"
          onClick={(e) => {
            e.stopPropagation(); // prevent mark-as-read
            navigateTo("comments", postId, "notifications");
          }}
        >
          View Post
        </button>
      )}

      <button
        className="notification-delete-btn"
        onClick={handleDelete}
        aria-label="Delete notification"
      >
        ✕
      </button>
    </div>
  );
}