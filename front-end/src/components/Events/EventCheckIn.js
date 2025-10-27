import './EventCheckIn.css';

export default function EventCheckIn({ navigateTo }) {
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
          src="https://picsum.photos/seed/checkin/400/300" 
          alt="Event" 
          className="event-checkin-image"
        />
        <h2 className="event-checkin-event-title">
          Fall Music Festival 2
        </h2>
        <div className="event-checkin-status">
          Check-in Available
        </div>
        <p className="event-checkin-location">
          You're at Kimmel Center
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

