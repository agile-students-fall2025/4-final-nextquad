import { getUserHostedEvents, getEventsNeedingAttention } from '../../data/Events/mockEventData';
import './RSVPsDashboard.css';

export default function RSVPsDashboard({ navigateTo }) {
  // TODO Sprint 2: Replace with backend API call
  // GET /api/events/user/hosting - Get events user is hosting
  const hostedEvents = getUserHostedEvents();
  
  // GET /api/events/user/needs-attention - Get events needing attention
  const needsAttentionEvents = getEventsNeedingAttention();

  return (
    <div className="rsvps-container">
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

      <div className="rsvps-content">
        {/* Needs Attention Section */}
        <div className="rsvps-attention-section">
          <h2 className="rsvps-attention-header">Needs Attention</h2>
          
          {needsAttentionEvents.length > 0 ? (
            needsAttentionEvents.map(event => (
              <div key={event.id} className="rsvps-attention-card">
                <h3 className="rsvps-attention-title">{event.title}</h3>
                <p className="rsvps-attention-info">{event.date} at {event.time}</p>
                <div className="rsvps-button-row">
                  {event.needsCheckIn && (
                    <button 
                      className="rsvps-action-button"
                      onClick={() => navigateTo('checkin', event.id)}
                    >
                      Check-ins
                    </button>
                  )}
                  {event.needsSurvey && (
                    <button 
                      className="rsvps-action-button"
                      onClick={() => navigateTo('survey', event.id)}
                    >
                      Take Survey
                    </button>
                  )}
                  <button 
                    className="rsvps-action-button-secondary"
                    onClick={() => navigateTo('detail', event.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="rsvps-empty">No events need attention</p>
          )}
        </div>

        {/* Upcoming Events Section - Shows events user is HOSTING */}
        <div className="rsvps-section">
          <h2 className="rsvps-section-header">Upcoming Events (Hosting)</h2>
          {hostedEvents.length > 0 ? (
            hostedEvents.map(event => (
              <div key={event.id} className="rsvps-card">
                <h3 className="rsvps-card-title">{event.title}</h3>
                <p className="rsvps-card-info">{event.date} at {event.time}</p>
                <p className="rsvps-card-info">{event.rsvpCount} RSVPs</p>
                <button 
                  className="rsvps-button"
                  onClick={() => navigateTo('detail', event.id)}
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="rsvps-empty">No hosted events</p>
          )}
        </div>
      </div>
    </div>
  );
}

