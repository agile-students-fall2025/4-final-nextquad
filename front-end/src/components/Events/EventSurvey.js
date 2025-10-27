import { useState } from 'react';
import './EventSurvey.css';

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
    <div className="event-survey-container">
      <div className="event-survey-header">
        <button className="event-survey-back-button" onClick={() => navigateTo('rsvps')}>
          ← Back
        </button>
        <h1 className="event-survey-title">Event Feedback</h1>
      </div>

      <form className="event-survey-form" onSubmit={handleSubmit}>
        <h2 className="event-survey-heading">
          How was Networking Mixer?
        </h2>

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
                <input type="checkbox" className="event-survey-checkbox" />
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

        <button type="submit" className="event-survey-submit-button">
          Submit Feedback
        </button>
        <button type="button" className="event-survey-skip-button" onClick={() => navigateTo('main')}>
          Skip for now
        </button>
      </form>
    </div>
  );
}

