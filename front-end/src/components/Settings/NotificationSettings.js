import React, { useEffect, useState } from "react";
import { getUserSettings, updateUserSettings } from "../../services/api";
import "./NotificationSettings.css";

export default function NotificationSettings({ navigateTo }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // get user preferences 
  useEffect(() => {
    getUserSettings()
      .then((data) => {
        if (data && data.data) setSettings(data.data);
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // check if all notifications are on
  const allEnabled = settings
    ? Object.entries(settings.notifications)
        .filter(([key]) => key !== "all")
        .every(([_, value]) => value)
    : false;

  // Handle toggling individual notification setting
  const handleToggle = (key) => {
    if (!settings || !settings.notifications) return;

    // Copy notifications object
    let updatedNotifications = { ...settings.notifications };

    if (key === "all") {
      // Toggle all notifications
      const newValue = !updatedNotifications.all;
      updatedNotifications = Object.fromEntries(
        Object.keys(updatedNotifications).map((k) => [k, newValue])
      );
    } else {
      // Toggle individual notification
      updatedNotifications[key] = !updatedNotifications[key];

      // Update "all" if all others are true
      const others = Object.entries(updatedNotifications)
        .filter(([k]) => k !== "all")
        .map(([_, v]) => v);
      updatedNotifications.all = others.every(Boolean);
    }

    setSettings({ ...settings, notifications: updatedNotifications });
  };

  // Save changes when leaving page
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
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="toggle-row">
              <span>{formatLabel(key)}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={key === "all" ? allEnabled : value}
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

//format buttons to read as user friendly labels
function formatLabel(key) {
  const labels = {
    all: "Turn On/Off All",
    emergencyAlerts: "Emergency Alerts",
    roomReservations: "Room Reservations",
    commentReplies: "Comment Replies",
    lostAndFound: "Lost & Found",
    marketplace: "Marketplace",
  };
  return labels[key] || key;
}
