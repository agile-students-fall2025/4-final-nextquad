import React, { useState } from 'react';
import './NotificationsPage.css'; 

export default function NotificationItem({ message, timestamp, isRead, onClick, onDelete }) {
  const [isFading, setIsFading] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      onDelete();
    }, 400); 
  };

  return (
    <div
      className={`notification-item ${isRead ? 'read' : 'unread'} ${isFading ? 'fade-out' : ''}`}
      onClick={onClick}
      role="button"
    >
      <div className="notification-content">
        <div className="notification-message">{message}</div>
        <div className="notification-timestamp">{timestamp}</div>
      </div>

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