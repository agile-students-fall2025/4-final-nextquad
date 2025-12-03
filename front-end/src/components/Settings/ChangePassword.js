import { useState } from 'react';
import { changeUserPassword } from '../../services/api';
import './ChangePassword.css';

export default function ChangePasswordForm({ navigateTo }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // verify in js 
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await changeUserPassword(currentPassword, newPassword, confirmPassword);

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to change password.');
        return;
      }

      setSuccessMessage('Password changed successfully.');

      setTimeout(() => {
        //bring user back to login
        navigateTo('auth');
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMessage('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-content">
        <h1 className="change-password-header">Change Password</h1>

        <form className="change-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p style={{ color: 'red' }}>
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p style={{ color: 'green'}}>
              {successMessage}
            </p>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>

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
