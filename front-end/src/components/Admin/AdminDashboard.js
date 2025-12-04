import './AdminDashboard.css';

export default function AdminDashboard({ navigateTo }) {

  const handleConfigureNotifications = () => {
    console.log('Navigate to notifications');
    navigateTo('adminNotifications');
  };

  const handleReportUser = () => {
    console.log('Navigate to report User');
    navigateTo('adminReportUser');
  };

  const handleFeed = () => {
    console.log('Navigate to Feed');
    navigateTo('adminFeed');
  };

  const handleEmergencyAlert = () => {
    console.log('Navigate to send Alert');
    navigateTo('adminEmergencyAlert');
  };
  const handleLogOut = () => {
    console.log('Logging out');
    navigateTo('auth');
  }

  return (
    <div className="settings-container">

      <div className="settings-content">
        <h1 className="settings-header">Admin Dashboard</h1>

        <button className="settings-button" onClick={handleConfigureNotifications}>
          Configure Notifications
        </button>

        <button className="settings-button" onClick={handleReportUser}>
          Reported Users
        </button>

        <button className="settings-button" onClick={handleFeed}>
          Feed
        </button>

        <button className="settings-button" onClick={handleEmergencyAlert}>
          Send Emergency Alert
        </button>

        <button className="logout-button" onClick={handleLogOut}>
          Log Out
        </button>
      </div>
    </div>
  );
}
