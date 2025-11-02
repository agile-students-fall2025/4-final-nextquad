import './AdminNotificationSettings.css';

export default function AdminNotifications({ navigateTo }) {
  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Configure Notifications</h1>

        <div className="toggle-group">
          <div className="toggle-row">
            <span>Turn On/Off All</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>Emergency Alerts</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>User Reports</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>New Posts</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <button className="back-button" onClick={() => navigateTo('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
