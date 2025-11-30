import React, { useEffect, useState } from "react";
import { getAdminSettings, updateAdminSettings } from "../../services/api";
import "./AdminNotificationSettings.css";

export default function AdminNotifications({ navigateTo }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin notification settings on mount
  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        if (data && data.data) setSettings(data.data);
      })
      .catch((err) => console.error("Error fetching admin settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // Toggle logic for notifications
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
        await updateAdminSettings({ notifications: settings.notifications });
      }
      navigateTo("dashboard");
    } catch (err) {
      console.error("Error updating admin settings:", err);
      navigateTo("dashboard");
    }
  };

  if (loading || !settings) {
    return (
      <div className="notification-container">
        <div className="notification-content">
          <h1 className="notification-header">Configure Notifications</h1>
          <p>Loading admin settings...</p>
        </div>
      </div>
    );
  }

  const { notifications } = settings;

  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Configure Notifications</h1>

        <div className="toggle-group">
          {["all", "emergencyAlerts", "userReports", "newPosts"].map((key) => (
            <div key={key} className="toggle-row">
              <span>{formatLabel(key)}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() => handleToggle(key)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>

        <button className="back-button" onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// Format readable labels
function formatLabel(key) {
  const labels = {
    all: "Turn On/Off All",
    emergencyAlerts: "Emergency Alerts",
    userReports: "User Reports",
    newPosts: "New Posts",
  };
  return labels[key] || key;
}
