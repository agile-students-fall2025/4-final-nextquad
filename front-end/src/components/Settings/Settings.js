import './Settings.css';

export default function Settings({ navigateTo }) {

  const handleLogout = () => {
    console.log('User logged out');
    // Clear auth data from session storage
    sessionStorage.removeItem('jwt');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('lastModule');
    sessionStorage.removeItem('lastPage');
    sessionStorage.removeItem('lastEventId');
    sessionStorage.removeItem('lastPostId');
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
