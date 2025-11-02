import "./AdminEmergencyAlert.css";

export default function AdminEmergencyAlert({ navigateTo }) {
  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Send Emergency Alert</h1>
      </div>

      <div className="admin-dashboard-content">
        <p>Compose your alert message:</p>
        <textarea placeholder="Enter alert message..." rows={5}></textarea>

        <button
          className="admin-dashboard-button alert"
          onClick={() => {
            alert("Emergency alert sent!");
            navigateTo("dashboard");
          }}
        >
          Send Alert
        </button>

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
