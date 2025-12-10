import React, { useEffect, useState } from "react";
import { getAllReports } from "../../services/api";
import "./AdminReportUser.css";

export default function AdminReportedUsers({ navigateTo }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getAllReports();
        if (response && response.success) {
          setReports(response.data);
        } else {
          setError("Failed to fetch reports. Please try again.");
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Server error — please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Reported Users</h1>
      </div>

      <div className="admin-dashboard-content">
        {loading && <p>Loading reports...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && reports.length === 0 && <p>No reports found.</p>}

        {!loading && reports.length > 0 && (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Reported User</th>
                <th>Reported By (Admin)</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                return (
                  <tr key={report._id}>
                    <td>{report.username?.email || "N/A"}</td>
                    <td>{report.admin?.email || "N/A"}</td>
                    <td>{report.reason}</td>
                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <button
          className="admin-dashboard-button"
          onClick={() => navigateTo("dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
