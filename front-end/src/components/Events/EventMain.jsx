import { useState, useEffect } from 'react';
import { mockEvents, categories } from '../../data/Events/mockEventData';
import { styles } from './eventStyles';

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
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'Latest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'Engagement') return b.rsvpCount - a.rsvpCount;
    return 0;
  });

  return (
    <div style={styles.container}>
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

      <div style={styles.controls}>
        <div style={styles.filterRow}>
          {/* Category Dropdown */}
          <div style={styles.sortContainer}>
            <button 
              style={styles.sortButton} 
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryMenu(!showCategoryMenu);
                setShowSortMenu(false);
              }}
            >
              Category: {selectedCategory} ▼
            </button>
            {showCategoryMenu && (
              <div style={styles.sortMenu}>
                {categories.map(cat => (
                  <div 
                    key={cat} 
                    style={styles.sortOption} 
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
          <div style={styles.sortContainer}>
            <button 
              style={styles.sortButton} 
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
                setShowCategoryMenu(false);
              }}
            >
              Sort: {sortBy} ▼
            </button>
            {showSortMenu && (
              <div style={styles.sortMenu}>
                {['Latest', 'Oldest', 'Engagement'].map(option => (
                  <div 
                    key={option} 
                    style={styles.sortOption} 
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
          style={styles.searchInput} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button 
          style={styles.createButton} 
          onClick={() => navigateTo('create')}
        >
          + Create New Event
        </button>
      </div>

      <div className="event-list" style={styles.eventList}>
        {sortedEvents.map(event => (
          <div 
            key={event.id} 
            style={styles.eventCard} 
            onClick={() => navigateTo('detail', event.id)}
          >
            <img src={event.image} alt={event.title} style={styles.eventImage} />
            <div style={styles.eventContent}>
              <h3 style={styles.eventTitle}>{event.title}</h3>
              <p style={styles.eventInfo}> {event.date} • {event.time}</p>
              <p style={styles.eventInfo}> {event.location}</p>
              <p style={styles.eventRsvp}> {event.rsvpCount} going</p>
              <div style={styles.tags}>
                {event.category.map(cat => (
                  <span key={cat} style={styles.tag}>#{cat}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}