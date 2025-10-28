// import ChangePasswordForm from '../components/ChangePassword';
import './Settings.css';

export default function Settings({ navigateTo }) {

  const handleLogout = () => {
    console.log('User logged out');
    navigateTo('home');
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {/* Settings Buttons */}
      <div className="settings-content">
        <button className="settings-button">Notification Settings</button>
        <button className="settings-button">Change Password</button>
        <button className="settings-button">Privacy Policy</button>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>

    </div>
  );
}
