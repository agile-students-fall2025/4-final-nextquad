import { getUserRSVPedEvents, getUserPastEvents } from '../../data/Events/mockEventData';
import './MyEvents.css';

export default function MyEvents({ navigateTo }) {
  // TODO Sprint 2: Replace with backend API call
  // GET /api/events/user/rsvps - Get events user has RSVP'd to (attending)
  const rsvpedEvents = getUserRSVPedEvents();
  
  // GET /api/events/user/past - Get user's past events
  const pastEvents = getUserPastEvents();

  return (
    <div className="my-events-container">
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

      <div className="my-events-content">
        {/* Upcoming Events - Shows events user has RSVP'd to (ATTENDING) */}
        <div className="my-events-section">
          <h2 className="my-events-section-header">Upcoming Events (Attending)</h2>
          {rsvpedEvents.length > 0 ? (
            rsvpedEvents.map(event => (
              <div key={event.id} className="my-events-card">
                <h3 className="my-events-card-title">{event.title}</h3>
                <p className="my-events-card-info">{event.date} at {event.time}</p>
                <p className="my-events-card-info">{event.location}</p>
                <button 
                  className="my-events-button"
                  onClick={() => navigateTo('detail', event.id)}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="my-events-empty">No upcoming events</p>
          )}
        </div>

        {/* Past Events */}
        <div className="my-events-section">
          <h2 className="my-events-section-header">Past Events</h2>
          {pastEvents.length > 0 ? (
            pastEvents.map(event => (
              <div key={event.id} className="my-events-card">
                <h3 className="my-events-card-title">{event.title}</h3>
                <p className="my-events-card-info">{event.date}</p>
                <button 
                  className="my-events-button"
                  onClick={() => navigateTo('analytics', event.id)}
                >
                  View Stats
                </button>
              </div>
            ))
          ) : (
            <p className="my-events-empty">No past events</p>
          )}
        </div>
      </div>
    </div>
  );
}

