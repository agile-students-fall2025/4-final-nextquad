import { styles } from './eventStyles';

export default function EventAnalytics({ navigateTo }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigateTo('my-events')}>
          ← Back
        </button>
        <h1 style={styles.title}>Event Analytics</h1>
      </div>

      <div style={{padding: '40px', backgroundColor: 'white', maxWidth: '1000px', margin: '0 auto'}}>
        <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#333'}}>
          Tech Talk: AI in Healthcare
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '32px'
        }}>
          {[
            { value: '67', label: 'Total RSVPs' },
            { value: '52', label: 'Attended' },
            { value: '77.6%', label: 'Check-in Rate' },
            { value: '4.5★', label: 'Avg Rating' }
          ].map((metric, i) => (
            <div key={i} style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#6B46C1',
                marginBottom: '8px'
              }}>
                {metric.value}
              </div>
              <div style={{fontSize: '12px', color: '#666'}}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{marginBottom: '32px'}}>
          <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333'}}>
            RSVP Timeline
          </h3>
          <div style={{
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '12px',
            height: '200px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '100%',
              gap: '8px'
            }}>
              {[20, 40, 60, 80, 100].map((height, i) => (
                <div key={i} style={{
                  flex: 1,
                  backgroundColor: '#6B46C1',
                  borderRadius: '4px 4px 0 0',
                  height: height + '%',
                  minHeight: '20px'
                }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{marginBottom: '24px'}}>
          <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333'}}>
            Key Insights
          </h3>
          {[
            { icon: '📈', text: 'Peak RSVP day was 5 days before event' },
            { icon: '👥', text: '78% of attendees were first-time participants' }
          ].map((insight, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <span style={{fontSize: '24px'}}>{insight.icon}</span>
              <p style={{fontSize: '14px', color: '#666', margin: 0}}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}