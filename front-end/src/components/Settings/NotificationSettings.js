import './NotificationSettings.css';

export default function NotificationSettings({ navigateTo }) {
  return (
    <div className="notification-container">
      <div className="notification-content">
        <h1 className="notification-header">Notification Settings</h1>

        <div className="toggle-group">
          <div className="toggle-row">
            <span>Turn On/Off All</span>
            <label className="switch">
              <input type="checkbox"  />
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
            <span>Room Reservations</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>Comment Replies</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>Lost & Found</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <span>Marketplace</span>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <button
          className="back-button"
          onClick={() => navigateTo('settings')}
        >
          Back to Settings
        </button>
      </div>
    </div>
  );
}
