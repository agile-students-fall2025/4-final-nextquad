import { useState, useEffect } from 'react';
import { checkRSVPStatus } from '../../services/api';
import './EventDetail.css';

export default function EventDetail({ event, navigateTo, onRSVP, previousPage = 'main' }) {
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch RSVP status from backend
  useEffect(() => {
    const fetchRSVPStatus = async () => {
      if (!event) return;
      
      try {
        setLoading(true);
        const response = await checkRSVPStatus(event.id);
        setRsvpStatus(response.data);
      } catch (error) {
        console.error('Error fetching RSVP status:', error);
        setRsvpStatus({ hasRSVPd: false, isHost: false, canRSVP: true });
      } finally {
        setLoading(false);
      }
    };

    fetchRSVPStatus();
  }, [event]);

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

          {/* RSVP Button based on backend status */}
          {loading ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              Loading...
            </button>
          ) : rsvpStatus && (rsvpStatus.hasRSVPd || rsvpStatus.isHost) ? (
            <button className="event-detail-rsvp-button-disabled" disabled>
              {rsvpStatus.isHost ? "You're Hosting" : "Already RSVP'd"}
            </button>
          ) : (
            <button 
              className="event-detail-rsvp-button"
              onClick={() => onRSVP(event.id)}
            >
              RSVP TO EVENT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

