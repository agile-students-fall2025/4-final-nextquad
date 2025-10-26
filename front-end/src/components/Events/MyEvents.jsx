import { getUserRSVPedEvents } from '../../data/Events/mockEventData';
import { styles } from './eventStyles';

export default function MyEvents({ navigateTo }) {
  // TODO Sprint 2: Replace with backend API call
  // GET /api/events/user/rsvps - Get events user has RSVP'd to (attending)
  const rsvpedEvents = getUserRSVPedEvents();

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
          My Events
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
          onClick={() => navigateTo('rsvps')}
        >
           My RSVPs
        </button>
      </div>

      <div style={styles.myEventsContent}>
        {/* Upcoming Events - Shows events user has RSVP'd to (ATTENDING) */}
        <div style={styles.eventSection}>
          <h2 style={styles.sectionHeader}>Upcoming Events (Attending)</h2>
          {rsvpedEvents.length > 0 ? (
            rsvpedEvents.map(event => (
              <div key={event.id} style={styles.myEventCard}>
                <h3 style={styles.myEventTitle}>{event.title}</h3>
                <p style={styles.myEventInfo}> {event.date} at {event.time}</p>
                <p style={styles.myEventInfo}> {event.location}</p>
                <button 
                  style={styles.secondaryButton} 
                  onClick={() => navigateTo('detail', event.id)}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p style={styles.emptyText}>No upcoming events</p>
          )}
        </div>

        {/* Past Events */}
        <div style={styles.eventSection}>
          <h2 style={styles.sectionHeader}>Past Events</h2>
          <div style={styles.myEventCard}>
            <h3 style={styles.myEventTitle}>Tech Talk: AI in Healthcare</h3>
            <p style={styles.myEventInfo}> Oct 20, 2025</p>
            <button 
              style={styles.secondaryButton} 
              onClick={() => navigateTo('analytics')}
            >
              View Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}