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
        if (data) setSettings(data.data.notifications);
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // check if all notifications are on
  const allEnabled = settings
    ? Object.entries(settings)
        .filter(([key]) => key !== "all")
        .every(([_, value]) => value)
    : false;

  // Handle toggling individual notification setting
  const handleToggle = (key) => {
    let updated = { ...settings, [key]: !settings[key] };

    // all button logic
    if (key === "all") {
      const newValue = !settings.all;
      updated = Object.fromEntries(
        Object.entries(settings).map(([k]) => [k, newValue])
      );
    } else {
      // if all individual toggles are on, set all to true
      const everyOn =
        Object.entries(updated)
          .filter(([k]) => k !== "all")
          .every(([_, v]) => v) === true;
      updated.all = everyOn;
    }

    setSettings(updated);

    // Send update to backend
    updateUserSettings(updated)
      .then((data) => {
        if (!data) {
          console.error(`Failed to update ${key}`);
        }
      })
      .catch((err) => console.error("Error updating setting:", err));
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

  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Notification Settings</h1>

        <div className="toggle-group">
          {Object.entries(settings).map(([key, value]) => (
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

        <button className="back-button" onClick={() => navigateTo("settings")}>
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
