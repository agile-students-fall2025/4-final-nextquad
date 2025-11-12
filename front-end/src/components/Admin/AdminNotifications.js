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
        if (data) setSettings(data.data.notifications);
      })
      .catch((err) => console.error("Error fetching admin settings:", err))
      .finally(() => setLoading(false));
  }, []);

  // Handle toggling logic
  const handleToggle = (key) => {
    let updated = { ...settings, [key]: !settings[key] };

    // Toggle all on/off
    if (key === "all") {
      const newValue = !settings.all;
      updated = Object.fromEntries(
        Object.entries(settings).map(([k]) => [k, newValue])
      );
    } else {
      // Update "all" if everything else is true
      const everyOn = Object.entries(updated)
        .filter(([k]) => k !== "all")
        .every(([_, v]) => v);
      updated.all = everyOn;
    }

    setSettings(updated);

    // Send to backend
    updateAdminSettings(updated).catch((err) =>
      console.error("Error updating admin settings:", err)
    );
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

  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Configure Notifications</h1>

        <div className="toggle-group">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="toggle-row">
              <span>{formatLabel(key)}</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleToggle(key)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>

        <button className="back-button" onClick={() => navigateTo("dashboard")}>
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
