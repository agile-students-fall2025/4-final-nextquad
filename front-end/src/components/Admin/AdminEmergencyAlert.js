import React, { useState } from "react";
import { createEmergencyAlert } from "../../services/api";
import "./AdminEmergencyAlert.css";

export default function AdminEmergencyAlert({ navigateTo }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendAlert = async () => {
    if (!message.trim()) {
      setError("Please enter an alert message before sending.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await createEmergencyAlert({ message, sentBy: "Admin" });

      if (response.success) {
        setSuccess(true);
        setMessage("");
        setTimeout(() => navigateTo("dashboard"), 1500);
      } else {
        setError("Failed to send alert. Please try again.");
      }
    } catch (err) {
      console.error("Error sending alert:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Send Emergency Alert</h1>
      </div>

      <div className="admin-dashboard-content">
        <p>Compose your alert message:</p>

        <textarea
          placeholder="Enter alert message..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="alert-textarea"
        ></textarea>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Alert sent successfully!</p>}

        <button
          className="admin-dashboard-button alert"
          onClick={handleSendAlert}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Alert"}
        </button>

        <button
          className="admin-dashboard-button"
          onClick={() => navigateTo("dashboard")}
          disabled={loading}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
