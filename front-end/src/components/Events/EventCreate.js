import { useState } from 'react';
import { categories, createEvent } from '../../services/api';
import './EventCreate.css';

export default function EventCreate({ navigateTo }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    categories: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert 24-hour time to 12-hour format
      let displayTime = formData.time;
      if (formData.time && formData.time.includes(':')) {
        const [hours, minutes] = formData.time.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        displayTime = `${h12}:${minutes} ${ampm}`;
      }
      
      // Call backend API
      await createEvent({
        title: formData.title,
        date: formData.date,
        time: displayTime,
        location: formData.location,
        description: formData.description,
        category: formData.categories
      });
      
      alert('Event created successfully!');
      navigateTo('main');
      
      // Trigger event list refresh
      setTimeout(() => {
        window.dispatchEvent(new Event('refreshEvents'));
      }, 100);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (cat) => {
    if (formData.categories.includes(cat)) {
      setFormData({...formData, categories: formData.categories.filter(c => c !== cat)});
    } else {
      setFormData({...formData, categories: [...formData.categories, cat]});
    }
  };

  return (
    <div className="event-create-container">
      <div className="event-create-header">
        <button 
          className="event-create-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back
        </button>
        <h1 className="event-create-title">Create Event</h1>
      </div>

      <form className="event-create-form" onSubmit={handleSubmit}>
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

        <div className="event-create-image-upload">
          <span style={{fontSize: '48px'}}>+</span>
          <p>Upload Event Photo</p>
        </div>

        <input 
          type="text" 
          placeholder="Event Title" 
          className="event-create-input"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <div className="event-create-input-row">
          <input 
            type="date" 
            className="event-create-input-half"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input 
            type="time" 
            className="event-create-input-half"
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
        </div>

        <input 
          type="text" 
          placeholder="Location" 
          className="event-create-input"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
        />

        <textarea 
          placeholder="Description" 
          className="event-create-textarea"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />

        <div className="event-create-categories">
          <p className="event-create-categories-title">
            Categories
          </p>
          <div className="event-create-categories-list">
            {categories.filter(c => c !== 'All').map(cat => (
              <button
                key={cat}
                type="button"
                className={formData.categories.includes(cat) ? 'event-create-category-button-active' : 'event-create-category-button'}
                onClick={() => toggleCategory(cat)}
              >
                #{cat}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="event-create-submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Publish Event'}
        </button>
      </form>
    </div>
  );
}

