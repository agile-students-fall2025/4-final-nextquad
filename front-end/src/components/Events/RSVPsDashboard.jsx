import { getUserHostedEvents } from '../../data/Events/mockEventData';
import { styles } from './eventStyles';

export default function RSVPsDashboard({ navigateTo }) {
  // TODO Sprint 2: Replace with backend API call
  // GET /api/events/user/hosting - Get events user is hosting
  const hostedEvents = getUserHostedEvents();

  return (
    <div style={styles.container}>
      {/* Quick Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '20px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button 
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#6B46C1',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
          onClick={() => navigateTo('main')}
        >
          ← Back to Events
        </button>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: '#333',
          marginRight: 'auto'
        }}>
          My RSVPs & Hosted Events
        </h2>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#6B46C1',
            border: '1px solid #6B46C1',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigateTo('my-events')}
        >
           My Events
        </button>
      </div>

      <div style={styles.dashboardContent}>
        {/* Needs Attention Section */}
        <div style={styles.attentionSection}>
          <h2 style={styles.attentionHeader}>Needs Attention</h2>
          
          <div style={styles.attentionCard}>
            <h3 style={styles.attentionTitle}>Fall Music Festival 2</h3>
            <p style={styles.attentionInfo}> Oct 26, 2025 at 7:00 PM</p>
            <div style={styles.buttonRow}>
              <button 
                style={styles.actionButton} 
                onClick={() => navigateTo('checkin')}
              >
                Check-ins
              </button>
              <button 
                style={styles.actionButtonSecondary}
                onClick={() => navigateTo('detail', 1)}
              >
                View Details
              </button>
            </div>
          </div>

          <div style={styles.attentionCard}>
            <h3 style={styles.attentionTitle}>Networking Mixer</h3>
            <p style={styles.attentionInfo}> Oct 22, 2025 at 6:00 PM</p>
            <div style={styles.buttonRow}>
              <button 
                style={styles.actionButton} 
                onClick={() => navigateTo('survey')}
              >
                Take Survey
              </button>
              <button 
                style={styles.actionButtonSecondary}
                onClick={() => navigateTo('detail', 1)}
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section - Shows events user is HOSTING */}
        <div style={styles.eventSection}>
          <h2 style={styles.sectionHeader}>Upcoming Events (Hosting)</h2>
          {hostedEvents.length > 0 ? (
            hostedEvents.map(event => (
              <div key={event.id} style={styles.myEventCard}>
                <h3 style={styles.myEventTitle}>{event.title}</h3>
                <p style={styles.myEventInfo}> {event.date} at {event.time}</p>
                <p style={styles.myEventInfo}> {event.rsvpCount} RSVPs</p>
                <button 
                  style={styles.secondaryButton}
                  onClick={() => navigateTo('detail', event.id)}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No hosted events</p>
          )}
        </div>
      </div>
    </div>
  );
}