import { useState, useEffect } from 'react';
import { getAllEvents, categories } from '../../services/api';
import './EventMain.css';

export default function EventMain({ navigateTo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Refreshing events list...');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('refreshEvents', handleRefresh);
    return () => window.removeEventListener('refreshEvents', handleRefresh);
  }, []);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('🔍 [EventMain] Fetching events from backend... (refreshKey:', refreshKey, ')');
        console.log('🔍 [EventMain] API URL:', process.env.REACT_APP_API_URL || 'http://localhost:3000/api');
        
        const sortParam = sortBy === 'Latest' ? 'latest' : sortBy === 'Oldest' ? 'oldest' : 'engagement';
        const response = await getAllEvents({
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sort: sortParam,
          showPast: 'false'
        });
        
        console.log('✅ [EventMain] Response received:', response);
        console.log('✅ [EventMain] Events count:', response.data?.length || 0);
        if (response.data && response.data.length > 0) {
          console.log('✅ [EventMain] First 3 event IDs:', response.data.slice(0, 3).map(e => e.id));
        }
        
        setEvents(response.data || []);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching events:', err);
        console.error('❌ Error details:', err.message);
        setError(`Failed to load events: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, selectedCategory, sortBy, refreshKey]);

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

  return (
    <div className="event-main-container">
      {/* Quick Navigation Bar */}
      <div className="event-main-nav-bar">
        <h2 className="event-main-nav-title">
          Browse Events
        </h2>
        <button 
          className="event-main-nav-button"
          onClick={() => navigateTo('my-events')}
        >
          My Events
        </button>
        <button 
          className="event-main-nav-button"
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

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading events...
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          No events found
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="event-list">
          {events.map(event => (
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
      )}
    </div>
  );
}

