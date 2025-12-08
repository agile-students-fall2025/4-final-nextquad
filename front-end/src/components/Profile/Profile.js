import './Profile.css';

export default function Profile({ navigateTo }) {
  const storedUser = sessionStorage.getItem('user');
  let user = {};
  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.error('Failed to parse user from sessionStorage:', err);
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Your Name';
  const email = user.email || user.nyuEmail || 'Email not set';
  const graduationYear = user.graduationYear ? `Class of ${user.graduationYear}` : 'Graduation year not set';
  const avatarUrl = user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'User')}&background=6b46c1&color=fff`;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <img src={avatarUrl} alt={fullName} className="profile-avatar" />
          <div>
            <h1 className="profile-name">{fullName}</h1>
            <p className="profile-email">{email}</p>
          </div>
        </div>

        <div className="profile-divider" />

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-label">Full name</span>
            <span className="profile-value">{fullName}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{email}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-label">Graduation year</span>
            <span className="profile-value">{graduationYear}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="profile-secondary" onClick={() => navigateTo('settings')}>
            Go to Settings
          </button>
        </div>
      </div>
    </div>
  );
}
