import './ChangePassword.css';

export default function ChangePasswordForm({ navigateTo }) {

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password changed (mock)');
    alert('Password changed successfully!');

    // Navigate back to login after short delay
    setTimeout(() => {
      if (navigateTo) navigateTo('login');
    }, 1500);
  };

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <h1 className="change-password-header">Change Password</h1>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="Confirm new password" />
          </div>

          <button type="submit" className="submit-button">Change Password</button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigateTo('settings')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
