import { styles } from './eventStyles';

export default function EventCheckIn({ navigateTo }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 style={styles.title}>Event Check-in</h1>
      </div>

      <div style={{padding: '40px', backgroundColor: 'white', textAlign: 'center', maxWidth: '700px', margin: '0 auto'}}>
        <img 
          src="https://picsum.photos/400/300?random=1" 
          alt="Event" 
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '12px',
            marginBottom: '16px'
          }} 
        />
        <h2 style={{fontSize: '20px', fontWeight: '700', margin: '0 0 12px 0', color: '#333'}}>
          Fall Music Festival 2
        </h2>
        <div style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#E8F5E9',
          color: '#4CAF50',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px'
        }}>
          ✓ Check-in Available
        </div>
        <p style={{fontSize: '14px', color: '#666', marginBottom: '32px'}}>
          ✓ You're at Kimmel Center
        </p>

        <div style={{marginBottom: '32px'}}>
          <div style={{
            display: 'inline-block',
            padding: '20px',
            backgroundColor: 'white',
            border: '2px solid #ddd',
            borderRadius: '12px'
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px'
            }}>
              <span style={{fontSize: '48px'}}>QR</span>
            </div>
          </div>
          <p style={{marginTop: '16px', fontSize: '14px', color: '#666'}}>
            Show this to event host
          </p>
        </div>

        <button style={styles.primaryButton} onClick={() => navigateTo('rsvps')}>
          Done
        </button>
      </div>
    </div>
  );
}