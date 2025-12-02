import { useState, useEffect } from 'react';
import { submitSurvey, checkSurveyStatus } from '../../services/api';
import './EventSurvey.css';

export default function EventSurvey({ navigateTo, event }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [enjoyedAspects, setEnjoyedAspects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user has already submitted survey
  useEffect(() => {
    const checkStatus = async () => {
      if (!event) return;
      
      try {
        setCheckingStatus(true);
        const response = await checkSurveyStatus(event.id);
        setHasSubmitted(response.data.hasSubmitted);
      } catch (err) {
        console.error('Error checking survey status:', err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [event]);

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
      setSuccess(false);
      
      // Call backend API
      await submitSurvey(event.id, {
        rating,
        enjoyedAspects,
        feedback
      });
      
      setSuccess(true);
      
      // Navigate after showing success message
      setTimeout(() => {
        navigateTo('rsvps');
      }, 1500);
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

  // Show loading while checking status
  if (checkingStatus) {
    return (
      <div className="event-survey-container">
        <div className="event-survey-header">
          <button className="event-survey-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-survey-title">Event Feedback</h1>
        </div>
        <div className="event-survey-form">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show "already submitted" message
  if (hasSubmitted) {
    return (
      <div className="event-survey-container">
        <div className="event-survey-header">
          <button className="event-survey-back-button" onClick={() => navigateTo('rsvps')}>
            ← Back
          </button>
          <h1 className="event-survey-title">Event Feedback</h1>
        </div>
        <div className="event-survey-form">
          <h2 className="event-survey-heading">Thank you!</h2>
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            You have already submitted feedback for {event.title}.
          </p>
          <button 
            className="event-survey-submit-button"
            onClick={() => navigateTo('rsvps')}
            style={{ marginTop: '30px' }}
          >
            Back to My RSVPs
          </button>
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

        {success && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: '#e8f5e9', 
            color: '#2e7d32', 
            borderRadius: '4px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ✓ Thank you for your feedback!
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

