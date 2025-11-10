import { useState, useEffect } from 'react';
import { getUserHostedEvents, getEventsNeedingAttention } from '../../services/api';
import './RSVPsDashboard.css';

export default function RSVPsDashboard({ navigateTo }) {
  const [hostedEvents, setHostedEvents] = useState([]);
  const [needsAttentionEvents, setNeedsAttentionEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRSVPData = async () => {
      try {
        setLoading(true);
        const [hostedResponse, attentionResponse] = await Promise.all([
          getUserHostedEvents(),
          getEventsNeedingAttention()
        ]);
        setHostedEvents(hostedResponse.data || []);
        
        // Backend returns {needsCheckIn: [...], needsSurvey: [...]}
        // Combine them into one array with flags
        const needsCheckIn = attentionResponse.needsCheckIn || [];
        const needsSurvey = attentionResponse.needsSurvey || [];
        const combined = [...needsCheckIn, ...needsSurvey];
        setNeedsAttentionEvents(combined);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching RSVP data:', err);
        setError('Failed to load RSVP data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPData();
  }, []);

  return (
    <div className="rsvps-container">
      {/* Quick Navigation Bar */}
      <div className="rsvps-nav-bar">
        <button 
          className="rsvps-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back to Events
        </button>
        <h2 className="rsvps-nav-title">
          My RSVPs & Hosted Events
        </h2>
        <button 
          className="rsvps-nav-button"
          onClick={() => navigateTo('my-events')}
        >
          My Events
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading RSVP data...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
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
      )}
    </div>
  );
}

