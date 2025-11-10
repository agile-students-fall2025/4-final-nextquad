import { useState } from 'react';
import { submitSurvey } from '../../services/api';
import './EventSurvey.css';

export default function EventSurvey({ navigateTo, event }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [enjoyedAspects, setEnjoyedAspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleAspect = (aspect) => {
    if (enjoyedAspects.includes(aspect)) {
      setEnjoyedAspects(enjoyedAspects.filter(a => a !== aspect));
    } else {
      setEnjoyedAspects([...enjoyedAspects, aspect]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Call backend API
      await submitSurvey(event.id, {
        rating,
        enjoyedAspects,
        feedback
      });
      
      alert('Thank you for your feedback!');
      navigateTo('rsvps');
    } catch (err) {
      console.error('Error submitting survey:', err);
      setError(err.message || 'Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If no event is provided, show a fallback
  if (!event) {
    return (
      <div className="event-survey-container">
        <div className="event-survey-header">
          <button className="event-survey-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-survey-title">Event Feedback</h1>
        </div>
        <div className="event-survey-form">
          <p>No event selected for survey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-survey-container">
      <div className="event-survey-header">
        <button className="event-survey-back-button" onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 className="event-survey-title">Event Feedback</h1>
      </div>

      <form className="event-survey-form" onSubmit={handleSubmit}>
        <h2 className="event-survey-heading">
          How was {event.title}?
        </h2>

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

        <div className="event-survey-section">
          <label className="event-survey-label">
            Overall Rating
          </label>
          <div className="event-survey-stars">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className="event-survey-star-button"
                onClick={() => setRating(star)}
              >
                {star <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>

        <div className="event-survey-section">
          <label className="event-survey-label">
            What did you enjoy most?
          </label>
          <div className="event-survey-checkboxes">
            {['Networking', 'Food', 'Venue', 'Activities'].map(option => (
              <label key={option} className="event-survey-checkbox-label">
                <input 
                  type="checkbox" 
                  className="event-survey-checkbox"
                  checked={enjoyedAspects.includes(option)}
                  onChange={() => toggleAspect(option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="event-survey-section">
          <label className="event-survey-label">
            Additional Comments
          </label>
          <textarea 
            className="event-survey-textarea"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts..."
          />
        </div>

        <button 
          type="submit" 
          className="event-survey-submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <button 
          type="button" 
          className="event-survey-skip-button" 
          onClick={() => navigateTo('rsvps')}
          disabled={loading}
        >
          Skip for now
        </button>
      </form>
    </div>
  );
}

