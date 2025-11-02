import './AdminReportUser.css';

export default function AdminReportUser({ navigateTo }) {
  const handleSubmitReport = () => {
    alert('User report submitted!');
    navigateTo('dashboard');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Report a User</h1>
      </div>

      <div className="admin-dashboard-content">
        <p>Enter details of the user report:</p>
        <input type="text" placeholder="Username of user" className="report-input" />
        <textarea placeholder="Reason for report..." rows={5} className="report-textarea"></textarea>

        <button
          className="admin-dashboard-button alert"
          onClick={handleSubmitReport}
        >
          Submit Report
        </button>

        <button
          className="admin-dashboard-button"
          onClick={() => navigateTo('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
