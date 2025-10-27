import { useState, useEffect } from 'react';
import { mockEvents, categories } from '../../data/Events/mockEventData';
import './EventMain.css';

export default function EventMain({ navigateTo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortMenu(false);
      setShowCategoryMenu(false);
    };
    
    if (showSortMenu || showCategoryMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu, showCategoryMenu]);

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category.includes(selectedCategory);
    // Filter out past events (only show upcoming events)
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    const isUpcoming = eventDate >= today;
    return matchesSearch && matchesCategory && isUpcoming;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'Latest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'Engagement') return b.rsvpCount - a.rsvpCount;
    return 0;
  });

  return (
    <div className="event-main-container">
      {/* Quick Navigation Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '20px 24px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: '#333',
          marginRight: 'auto'
        }}>
          Browse Events
        </h2>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#6B46C1',
            border: '1px solid #6B46C1',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigateTo('my-events')}
        >
          My Events
        </button>
        <button 
          style={{
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#6B46C1',
            border: '1px solid #6B46C1',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={() => navigateTo('rsvps')}
        >
          My RSVPs
        </button>
      </div>

      <div className="event-main-controls">
        <div className="event-main-filter-row">
          {/* Category Dropdown */}
          <div className="event-main-sort-container">
            <button 
              className="event-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryMenu(!showCategoryMenu);
                setShowSortMenu(false);
              }}
            >
              Category: {selectedCategory} ▼
            </button>
            {showCategoryMenu && (
              <div className="event-main-sort-menu">
                {categories.map(cat => (
                  <div 
                    key={cat} 
                    className="event-main-sort-option"
                    onClick={() => { 
                      setSelectedCategory(cat); 
                      setShowCategoryMenu(false); 
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <div className="event-main-sort-container">
            <button 
              className="event-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
                setShowCategoryMenu(false);
              }}
            >
              Sort: {sortBy} ▼
            </button>
            {showSortMenu && (
              <div className="event-main-sort-menu">
                {['Latest', 'Oldest', 'Engagement'].map(option => (
                  <div 
                    key={option} 
                    className="event-main-sort-option"
                    onClick={() => { 
                      setSortBy(option); 
                      setShowSortMenu(false); 
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Search events..." 
          className="event-main-search-input"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button 
          className="event-main-create-button"
          onClick={() => navigateTo('create')}
        >
          + Create New Event
        </button>
      </div>

      <div className="event-list">
        {sortedEvents.map(event => (
          <div 
            key={event.id} 
            className="event-card"
            onClick={() => navigateTo('detail', event.id)}
          >
            <img src={event.image} alt={event.title} className="event-card-image" />
            <div className="event-card-content">
              <h3 className="event-card-title">{event.title}</h3>
              <p className="event-card-info"> {event.date} • {event.time}</p>
              <p className="event-card-info"> {event.location}</p>
              <p className="event-card-rsvp"> {event.rsvpCount} going</p>
              <div className="event-card-tags">
                {event.category.map(cat => (
                  <span key={cat} className="event-card-tag">#{cat}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

