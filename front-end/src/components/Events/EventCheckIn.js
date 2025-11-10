import { useState } from 'react';
import { checkInToEvent } from '../../services/api';
import './EventCheckIn.css';

export default function EventCheckIn({ navigateTo, event }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckIn = async () => {
    if (!event) return;

    try {
      setLoading(true);
      setError(null);
      await checkInToEvent(event.id);
      setCheckedIn(true);
      alert('Successfully checked in to the event!');
    } catch (err) {
      console.error('Error checking in:', err);
      setError(err.message || 'Failed to check in');
      alert(`Check-in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // If no event is provided, show a fallback message
  if (!event) {
    return (
      <div className="event-checkin-container">
        <div className="event-checkin-header">
          <button className="event-checkin-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-checkin-title">Event Check-in</h1>
        </div>
        <div className="event-checkin-content">
          <p>No event selected for check-in</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-checkin-container">
      <div className="event-checkin-header">
        <button className="event-checkin-back-button" onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 className="event-checkin-title">Event Check-in</h1>
      </div>

      <div className="event-checkin-content">
        <img 
          src={event.image} 
          alt={event.title} 
          className="event-checkin-image"
        />
        <h2 className="event-checkin-event-title">
          {event.title}
        </h2>
        <div className="event-checkin-status">
          {checkedIn ? 'Checked In ✓' : 'Check-in Available'}
        </div>
        <p className="event-checkin-location">
          You're at {event.location}
        </p>

        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#ffebee', 
            color: '#d32f2f', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div className="event-checkin-qr-section">
          <div className="event-checkin-qr-container">
            <div className="event-checkin-qr-code">
              <span>QR</span>
            </div>
          </div>
          <p className="event-checkin-qr-label">
            Show this to event host
          </p>
        </div>

        {!checkedIn ? (
          <button 
            className="event-checkin-button" 
            onClick={handleCheckIn}
            disabled={loading}
          >
            {loading ? 'Checking In...' : 'Check In'}
          </button>
        ) : (
          <button className="event-checkin-button" onClick={() => navigateTo('rsvps')}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}

