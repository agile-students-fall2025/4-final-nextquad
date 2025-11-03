import FeedMain from '../Feed/FeedMain';
import './AdminFeedMain.css';

export default function AdminFeedMain({ navigateTo }) {
  return (
    <div className="admin-feed-wrapper">
      <div className="admin-feed-header">
        <button
          className="admin-feed-back-button"
          onClick={() => navigateTo('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <FeedMain navigateTo={navigateTo} isAdmin={true} />
    </div>
  );
}
