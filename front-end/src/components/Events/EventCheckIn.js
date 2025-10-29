import './EventCheckIn.css';

export default function EventCheckIn({ navigateTo, event }) {
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
          Check-in Available
        </div>
        <p className="event-checkin-location">
          You're at {event.location}
        </p>

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

        <button className="event-checkin-button" onClick={() => navigateTo('rsvps')}>
          Done
        </button>
      </div>
    </div>
  );
}

