import { styles } from './eventStyles';

export default function EventDetail({ event, navigateTo, onRSVP, previousPage = 'main', hideRSVPButton = false }) {
  if (!event) return null;

  // TODO Sprint 2: Backend should handle RSVP logic
  // POST /api/events/:id/rsvp - RSVP to an event
  // DELETE /api/events/:id/rsvp - Cancel RSVP
  // GET /api/events/:id/rsvp-status - Check if user has RSVP'd
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backButton} 
          onClick={() => navigateTo(previousPage)}
        >
          ← Back
        </button>
        <h1 style={styles.title}>Event Details</h1>
      </div>

      {/* White container that includes both image and content */}
      <div style={{ 
        backgroundColor: 'white',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <img src={event.image} alt={event.title} style={styles.heroImage} />
        </div>
      
        <div style={styles.detailContent}>
          <h2 style={styles.detailTitle}>{event.title}</h2>
          <p style={styles.detailInfo}> {event.date} at {event.time}</p>
          <p style={styles.detailInfo}> {event.location}</p>
          <p style={styles.detailInfo}> {event.rsvpCount} going</p>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>About this event</h3>
            <p style={styles.description}>{event.description}</p>
          </div>

          <div style={styles.hostSection}>
            <img 
              src={event.host.avatar} 
              alt={event.host.name} 
              style={styles.hostAvatar} 
            />
            <div>
              <p style={styles.hostLabel}>Hosted by</p>
              <p style={styles.hostName}>{event.host.name}</p>
            </div>
          </div>

          {/* Hide RSVP button if user is the host, otherwise show RSVP status */}
          {!hideRSVPButton && (
            <>
              {/* TODO Sprint 2: Check hasUserRSVPed from backend */}
              {event.hasUserRSVPed ? (
                <button style={styles.rsvpButtonDisabled} disabled>
                  ✓ Already RSVP'd
                </button>
              ) : (
                <button 
                  style={styles.rsvpButton} 
                  onClick={() => onRSVP(event.id)}
                >
                  RSVP TO EVENT
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
