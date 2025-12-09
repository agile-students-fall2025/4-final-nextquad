import React, { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "../../services/api";
import "./NotificationSettings.css";

export default function NotificationSettings({ navigateTo }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set preferred display order (excluding roomReservations)
  const displayOrder = [
    "all",
    "emergencyAlerts",
    "commentReplies",
    "lostAndFound",
    "marketplace",
    "roommateRequest",
  ];

  // Get user preferences
  useEffect(() => {
    getUserSettings()
      .then((data) => {
        if (data && data.data) setSettings(data.data);
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // Check if all toggles (excluding 'all' and 'roomReservations') are on
  const allEnabled = settings
    ? Object.entries(settings.notifications)
        .filter(([key]) => key !== "all" && key !== "roomReservations")
        .every(([_, value]) => value)
    : false;

  // Toggle individual or all notification settings
  const handleToggle = (key) => {
    if (!settings || !settings.notifications) return;

    let updatedNotifications = { ...settings.notifications };

    if (key === "all") {
      const newValue = !updatedNotifications.all;
      updatedNotifications = Object.fromEntries(
        Object.keys(updatedNotifications).map((k) => [k, newValue])
      );
    } else {
      updatedNotifications[key] = !updatedNotifications[key];

      const others = Object.entries(updatedNotifications)
        .filter(([k]) => k !== "all" && k !== "roomReservations")
        .map(([_, v]) => v);
      updatedNotifications.all = others.every(Boolean);
    }

    setSettings({ ...settings, notifications: updatedNotifications });
  };

  // Save settings and go back
  const handleBack = async () => {
    try {
      if (settings && settings.notifications) {
        await updateUserSettings({ notifications: settings.notifications });
      }
      navigateTo("settings");
    } catch (err) {
      console.error("Error updating user settings:", err);
      navigateTo("settings");
    }
  };

  if (loading || !settings) {
    return (
      <div className="notification-container">
        <div className="notification-content">
          <h1 className="notification-header">Notification Settings</h1>
          <p>Loading your notification preferences...</p>
        </div>
      </div>
    );
  }

  const { notifications } = settings;

  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Notification Settings</h1>

        <div className="toggle-group">
          {displayOrder
            .filter((key) => key in notifications)
            .map((key) => (
              <div key={key} className="toggle-row">
                <span>{formatLabel(key)}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={key === "all" ? allEnabled : notifications[key]}
                    onChange={() => handleToggle(key)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
        </div>

        <button className="back-button" onClick={handleBack}>
          Back to Settings
        </button>
      </div>
    </div>
  );
}

// Format buttons to user-friendly labels
function formatLabel(key) {
  const labels = {
    all: "Turn On/Off All",
    emergencyAlerts: "Emergency Alerts",
    roommateRequest: "Roommate Requests",
    commentReplies: "Comment Replies",
    lostAndFound: "Lost & Found",
    marketplace: "Marketplace",
    // roomReservations excluded
  };
  return labels[key] || key;
}