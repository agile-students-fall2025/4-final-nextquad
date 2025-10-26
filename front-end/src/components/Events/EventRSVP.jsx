import { styles } from './eventStyles';

export default function EventRSVP({ event, navigateTo }) {
  if (!event) return null;
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>RSVP Confirmed</h1>
      </div>

      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        backgroundColor: 'white',
        maxWidth: '700px',
        margin: '0 auto'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '40px',
          backgroundColor: '#4CAF50',
          color: 'white',
          fontSize: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          ✓
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: '0 0 8px 0',
          color: '#333'
        }}>
          You're all set!
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '32px'
        }}>
          See you there
        </p>

        <div style={{
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <img 
            src={event.image} 
            alt={event.title} 
            style={{
              width: '100%',
              height: '150px',
              objectFit: 'cover',
              borderRadius: '8px',
              marginBottom: '16px'
            }} 
          />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 12px 0',
            color: '#333'
          }}>
            {event.title}
          </h3>
          <p style={{fontSize: '14px', color: '#666', margin: '4px 0'}}>
             {event.date} at {event.time}
          </p>
          <p style={{fontSize: '14px', color: '#666', margin: '4px 0'}}>
             {event.location}
          </p>
        </div>

        <button 
          style={styles.primaryButton} 
          onClick={() => navigateTo('main')}
        >
          Browse More Events
        </button>
      </div>
    </div>
  );
}