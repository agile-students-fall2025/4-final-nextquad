import React, { useState } from "react";
import { createReport } from "../../services/api"; 
import "./AdminReportUser.css";

export default function AdminReportUser({ navigateTo }) {
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitReport = async () => {
    // Simple validation
    if (!username.trim() || !reason.trim()) {
      setError("Please fill in both fields before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createReport({ username, reason });

      if (response && response.success) {
        alert("User report submitted successfully!");
        navigateTo("dashboard");
      } else {
        setError("Failed to submit the report. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      setError("Server error — please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Report a User</h1>
      </div>

      <div className="admin-dashboard-content">
        <p>Enter details of the user report:</p>

        <input
          type="text"
          placeholder="Username of user"
          className="report-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <textarea
          placeholder="Reason for report..."
          rows={5}
          className="report-textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></textarea>

        {error && <p className="error-text">{error}</p>}

        <button
          className="admin-dashboard-button alert"
          onClick={handleSubmitReport}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Report"}
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
