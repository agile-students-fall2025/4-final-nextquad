import './EventRSVP.css';

export default function EventRSVP({ event, navigateTo }) {
  if (!event) return null;
  
  return (
    <div className="event-rsvp-container">
      <div className="event-rsvp-header">
        <h1 className="event-rsvp-title">RSVP Confirmed</h1>
      </div>

      <div className="event-rsvp-content">
        <div className="event-rsvp-checkmark">
          ✓
        </div>
        <h2 className="event-rsvp-heading">
          You're all set!
        </h2>
        <p className="event-rsvp-subheading">
          See you there
        </p>

        <div className="event-rsvp-event-card">
          <img 
            src={event.image} 
            alt={event.title} 
            className="event-rsvp-event-image"
          />
          <h3 className="event-rsvp-event-title">
            {event.title}
          </h3>
              <p className="event-rsvp-event-info">
            {event.date} at {event.time}
          </p>
          <p className="event-rsvp-event-info">
            {event.location}
          </p>
        </div>

        <button 
          className="event-rsvp-button"
          onClick={() => navigateTo('main')}
        >
          Browse More Events
        </button>
      </div>
    </div>
  );
}

