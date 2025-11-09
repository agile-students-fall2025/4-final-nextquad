import { useState, useEffect } from 'react';
import { getUserRSVPedEvents, getUserPastEvents } from '../../services/api';
import './MyEvents.css';

export default function MyEvents({ navigateTo }) {
  const [rsvpedEvents, setRsvpedEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        const [rsvpsResponse, pastResponse] = await Promise.all([
          getUserRSVPedEvents(),
          getUserPastEvents()
        ]);
        setRsvpedEvents(rsvpsResponse.data || []);
        setPastEvents(pastResponse.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching user events:', err);
        setError('Failed to load your events. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  return (
    <div className="my-events-container">
      {/* Quick Navigation Bar */}
      <div className="my-events-nav-bar">
        <button 
          className="my-events-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back to Events
        </button>
        <h2 className="my-events-nav-title">
          My Events
        </h2>
        <button 
          className="my-events-nav-button"
          onClick={() => navigateTo('rsvps')}
        >
          My RSVPs
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading your events...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
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
      )}
    </div>
  );
}

