import './Settings.css';

export default function Settings({ navigateTo }) {

  const handleLogout = () => {
    console.log('User logged out');
    // Clear auth data from localStorage
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('lastModule');
    localStorage.removeItem('lastPage');
    localStorage.removeItem('lastEventId');
    localStorage.removeItem('lastPostId');
    navigateTo('auth'); 
  };

  const handleChangePassword = () => {
    console.log('Navigating to Change Password');
    navigateTo('changePassword');
  }
  const handlePrivacyPolicy = () => {
    console.log('Navigating to Privacy Policy');
    navigateTo('privacyPolicy');
  }
  const handleNotificationSettings = () => {
    console.log('Navigating to Notification Settings');
    navigateTo('notificationSettings');
  }

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {/* Settings Buttons */}
      <div className="settings-content">
        <button className="settings-button" onClick={handleNotificationSettings}>Notification Settings</button>
        <button className="settings-button" onClick={handleChangePassword}>Change Password</button>
        <button className="settings-button" onClick={handlePrivacyPolicy}>Privacy Policy</button>
        <button className="logout-button" onClick={handleLogout}>Log Out</button>
      </div>

    </div>
  );
}
