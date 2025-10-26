import { useState } from 'react';
import { categories } from '../../data/Events/mockEventData';
import { styles } from './eventStyles';

export default function EventCreate({ navigateTo }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    categories: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO Sprint 2: Send to backend
    // POST /api/events - Create new event
    // Body: { title, date, time, location, description, categories, image }
    console.log('Sprint 2: POST /api/events with data:', formData);
    alert('Event created successfully!');
    navigateTo('main');
  };

  const toggleCategory = (cat) => {
    if (formData.categories.includes(cat)) {
      setFormData({...formData, categories: formData.categories.filter(c => c !== cat)});
    } else {
      setFormData({...formData, categories: [...formData.categories, cat]});
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          style={styles.backButton} 
          onClick={() => navigateTo('main')}
        >
          ← Back
        </button>
        <h1 style={styles.title}>Create Event</h1>
      </div>

      <form style={{padding: '32px', backgroundColor: 'white', maxWidth: '900px', margin: '0 auto'}} onSubmit={handleSubmit}>
        <div style={{marginBottom: '20px'}}>
          <div style={{
            width: '100%',
            height: '150px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: '#f9f9f9'
          }}>
            <span style={{fontSize: '48px', marginBottom: '8px'}}>📷</span>
            <p>Upload Event Photo</p>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Event Title" 
          style={styles.searchInput}
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
          <input 
            type="date" 
            style={{...styles.searchInput, flex: 1, marginBottom: 0}}
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            required
          />
          <input 
            type="time" 
            style={{...styles.searchInput, flex: 1, marginBottom: 0}}
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
            required
          />
        </div>

        <input 
          type="text" 
          placeholder="Location" 
          style={styles.searchInput}
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          required
        />

        <textarea 
          placeholder="Description" 
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            fontSize: '15px',
            marginBottom: '16px',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />

        <div style={{marginBottom: '24px'}}>
          <p style={{fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333'}}>
            Categories
          </p>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {categories.filter(c => c !== 'All').map(cat => (
              <button
                key={cat}
                type="button"
                style={formData.categories.includes(cat) ? {
                  padding: '8px 16px',
                  backgroundColor: '#6B46C1',
                  border: '1px solid #6B46C1',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: 'white'
                } : {
                  padding: '8px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#666'
                }}
                onClick={() => toggleCategory(cat)}
              >
                #{cat}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" style={styles.createButton}>
          Publish Event
        </button>
      </form>
    </div>
  );
}