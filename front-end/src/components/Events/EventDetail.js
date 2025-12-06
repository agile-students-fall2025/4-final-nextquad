import { useState, useEffect } from 'react';
import { checkRSVPStatus } from '../../services/api';
import './EventDetail.css';

export default function EventDetail({ event, navigateTo, onRSVP, previousPage = 'main' }) {
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpError, setRsvpError] = useState(null);

  // Helper function to parse event date and time into a Date object
  const parseEventDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    
    // Parse date (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Parse time (e.g., "8:00 PM" or "3:30 PM")
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return new Date(year, month - 1, day, hours, minutes);
  };

  // Check if event is past (considering both date and time)
  const isPastEvent = () => {
    if (!event?.date || !event?.time) return false;
    const eventDateTime = parseEventDateTime(event.date, event.time);
    if (!eventDateTime) return false;
    const now = new Date();
    return eventDateTime < now;
  };

  // Fetch RSVP status from backend
  useEffect(() => {
    const fetchRSVPStatus = async () => {
      if (!event) return;
      
      // Check if user is logged in - use sessionStorage which is where token is stored
      const token = sessionStorage.getItem('jwt');
      if (!token) {
        setRsvpStatus({ hasRSVPd: false, isHost: false, canRSVP: false, needsLogin: true });
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await checkRSVPStatus(event.id);
        setRsvpStatus(response.data);
      } catch (error) {
        console.error('Error fetching RSVP status:', error);
        // Check if it's an authentication error
        const errorMsg = error.message?.toLowerCase() || '';
        const isAuthError = error.status === 401 || errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('token');
        if (isAuthError) {
          setRsvpStatus({ hasRSVPd: false, isHost: false, canRSVP: false, needsLogin: true });
        } else {
          // For other errors, assume user can RSVP
          setRsvpStatus({ hasRSVPd: false, isHost: false, canRSVP: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPStatus();
  }, [event]);

  const handleRSVPClick = async () => {
    setRsvpError(null);
    try {
      await onRSVP(event.id);
    } catch (error) {
      setRsvpError('Failed to RSVP. Please try again.');
    }
  };

  if (!event) return null;
  
  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button 
          className="event-detail-back-button"
          onClick={() => navigateTo(previousPage)}
        >
          ← Back
        </button>
        <h1 className="event-detail-title">Event Details</h1>
      </div>

      {/* White container that includes both image and content */}
      <div style={{ 
        backgroundColor: 'white',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <div style={{ maxWidth: '900px', width: '100%' }}>
          <img src={event.image} alt={event.title} className="event-detail-hero-image" />
        </div>
      
        <div className="event-detail-content">
          <h2 className="event-detail-content-title">{event.title}</h2>
          <p className="event-detail-info"> {event.date} at {event.time}</p>
          <p className="event-detail-info"> {event.location}</p>
          <p className="event-detail-info"> {event.rsvpCount} going</p>

          <div className="event-detail-section">
            <h3 className="event-detail-section-title">About this event</h3>
            <p className="event-detail-description">{event.description}</p>
          </div>

          <div className="event-detail-host-section">
            <img 
              src={event.host.avatar} 
              alt={event.host.name} 
              className="event-detail-host-avatar"
            />
            <div>
              <p className="event-detail-host-label">Hosted by</p>
              <p className="event-detail-host-name">{event.host.name}</p>
            </div>
          </div>

          {/* RSVP Error Message */}
          {rsvpError && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {rsvpError}
            </div>
          )}

          {/* RSVP Button based on backend status */}
          {loading ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              Loading...
            </button>
          ) : isPastEvent() ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              Event has ended
            </button>
          ) : rsvpStatus?.needsLogin ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              Please log in to RSVP
            </button>
          ) : rsvpStatus && (rsvpStatus.hasRSVPd || rsvpStatus.isHost) ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              {rsvpStatus.isHost ? "You're Hosting" : "Already RSVP'd"}
            </button>
          ) : (
            <button 
              className="event-detail-rsvp-button"
              onClick={handleRSVPClick}
            >
              RSVP TO EVENT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

