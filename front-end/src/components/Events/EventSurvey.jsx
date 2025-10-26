import { useState } from 'react';
import { styles } from './eventStyles';

export default function EventSurvey({ navigateTo }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO Sprint 2: Send survey to backend
    // POST /api/events/:id/survey
    // Body: { rating, enjoyedAspects, feedback }
    console.log('Sprint 2: POST survey data:', { rating, feedback });
    alert('Thank you for your feedback!');
    navigateTo('main');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 style={styles.title}>Event Feedback</h1>
      </div>

      <form style={{padding: '40px', backgroundColor: 'white', maxWidth: '900px', margin: '0 auto'}} onSubmit={handleSubmit}>
        <h2 style={{fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#333'}}>
          How was Networking Mixer?
        </h2>

        <div style={{marginBottom: '24px'}}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            Overall Rating
          </label>
          <div style={{display: 'flex', gap: '8px', fontSize: '32px'}}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#FFD700',
                  fontSize: '32px',
                  padding: '4px'
                }}
                onClick={() => setRating(star)}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom: '24px'}}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            What did you enjoy most?
          </label>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {['Networking', 'Food', 'Venue', 'Activities'].map(option => (
              <label key={option} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                color: '#333'
              }}>
                <input type="checkbox" style={{width: '18px', height: '18px', cursor: 'pointer'}} />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div style={{marginBottom: '24px'}}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            Additional Comments
          </label>
          <textarea 
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '15px',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
          />
        </div>

        <button type="submit" style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#6B46C1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginBottom: '12px'
        }}>
          Submit Feedback
        </button>
        <button type="button" style={{
          width: '100%',
          padding: '16px',
          backgroundColor: 'transparent',
          color: '#999',
          border: 'none',
          fontSize: '14px',
          cursor: 'pointer'
        }} onClick={() => navigateTo('main')}>
          Skip for now
        </button>
      </form>
    </div>
  );
}