import { useState, useEffect, useCallback } from 'react';
import { getUserHostedEvents } from '../../services/api';
import './MyEvents.css';

export default function MyEvents({ navigateTo }) {
  const [hostedEvents, setHostedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching user hosted events...');
      const hostedResponse = await getUserHostedEvents();
      console.log('✅ Hosted events received:', hostedResponse.data);
      setHostedEvents(hostedResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching user events:', err);
      setError('Failed to load your events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserEvents();
  }, [fetchUserEvents]);

  // Listen for refresh events from EventCreate
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Refreshing my events list...');
      fetchUserEvents();
    };
    
    window.addEventListener('refreshEvents', handleRefresh);
    return () => window.removeEventListener('refreshEvents', handleRefresh);
  }, [fetchUserEvents]);

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
          {/* Events I'm Hosting */}
          <div className="my-events-section">
            <h2 className="my-events-section-header">Events I'm Hosting</h2>
            {hostedEvents.length > 0 ? (
              hostedEvents.map(event => (
                <div key={event.id} className="my-events-card">
                  <h3 className="my-events-card-title">{event.title}</h3>
                  <p className="my-events-card-info">{event.date} at {event.time}</p>
                  <p className="my-events-card-info">{event.location}</p>
                  <p className="my-events-card-info" style={{ color: '#57068c', fontWeight: '600' }}>
                    {event.rsvpCount} RSVPs
                  </p>
                  <button 
                    className="my-events-button"
                    onClick={() => navigateTo('detail', event.id)}
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="my-events-empty">You're not hosting any events yet. Create one to get started!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

