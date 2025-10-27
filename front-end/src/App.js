import { useMemo, useState } from 'react';
import { mockEvents } from './data/Events/mockEventData';
import './App.css';
import './index.css';

// Import all components
import Header from './components/campus_map/Header';
import MapCanvas from './components/campus_map/MapCanvas';
import EventMain from './components/Events/EventMain';
import EventDetail from './components/Events/EventDetail';
import EventRSVP from './components/Events/EventRSVP';
import EventCreate from './components/Events/EventCreate';
import MyEvents from './components/Events/MyEvents';
import RSVPsDashboard from './components/Events/RSVPsDashboard';
import EventCheckIn from './components/Events/EventCheckIn';
import EventSurvey from './components/Events/EventSurvey';
import EventAnalytics from './components/Events/EventAnalytics';
import FilterDropdown from './components/campus_map/FilterDropdown';
import { CATEGORIES } from './data/campus_map/mapPoints';
import './components/campus_map/FilterDropdown.css';


export default function App() {
  const [activeModule, setActiveModule] = useState('events');
  const [currentPage, setCurrentPage] = useState('main');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [previousPage, setPreviousPage] = useState('main'); // Track where user came from
  // TODO Sprint 2: This will be managed by backend session/auth
  // For now, we track RSVP'd events in local state
  const [rsvpedEventIds, setRsvpedEventIds] = useState([2, 3]); // Mock: user has RSVP'd to events 2 and 3
  const allIds = useMemo(() => CATEGORIES.map(c => c.id), []);
  const [activeCats, setActiveCats] = useState(new Set(allIds));

  const selectedEvent = useMemo(
    () => mockEvents.find((event) => event.id === selectedEventId) || null,
    [selectedEventId]
  );

  const navigateTo = (page, eventId = null) => {
    // Track where we're coming from for proper back navigation
    if (page === 'detail') {
      setPreviousPage(currentPage);
    }
    setCurrentPage(page);
    setSelectedEventId(eventId);
  };

  const handleRSVP = (eventId) => {
    // TODO Sprint 2: Call backend API
    // POST /api/events/:id/rsvp
    console.log(`Sprint 2: POST /api/events/${eventId}/rsvp`);

    if (!rsvpedEventIds.includes(eventId)) {
      setRsvpedEventIds((prev) => [...prev, eventId]);

      // Update the mock event data to reflect RSVP
      const event = mockEvents.find((e) => e.id === eventId);
      if (event) {
        event.hasUserRSVPed = true;
      }
    }

    navigateTo('rsvp-confirm', eventId);
  };

  const renderEventPage = () => {
    switch (currentPage) {
      case 'detail':
        return (
          <EventDetail
            event={selectedEvent}
            navigateTo={navigateTo}
            onRSVP={handleRSVP}
            previousPage={previousPage}
            hideRSVPButton={selectedEvent?.isUserHost} // Hide RSVP button if user is the host
          />
        );
      case 'rsvp-confirm':
        return <EventRSVP event={selectedEvent} navigateTo={navigateTo} />;
      case 'create':
        return <EventCreate navigateTo={navigateTo} />;
      case 'my-events':
        return <MyEvents navigateTo={navigateTo} />;
      case 'rsvps':
        return <RSVPsDashboard navigateTo={navigateTo} />;
      case 'checkin':
        return <EventCheckIn navigateTo={navigateTo} />;
      case 'survey':
        return <EventSurvey navigateTo={navigateTo} />;
      case 'analytics':
        return <EventAnalytics navigateTo={navigateTo} />;
      case 'main':
      default:
        return <EventMain navigateTo={navigateTo} />;
    }
  };

  const renderActiveModule = () => {
    if (activeModule === 'events') {
      return <div className="events-wrapper">{renderEventPage()}</div>;
    }

    return (
      <div className="map-wrapper">
        <Header />
        <div className="filter-bar">
          <FilterDropdown
            value={activeCats}
            onSave={(nextSet) => setActiveCats(new Set(nextSet))}  
          />
        </div>
        <div className="map-canvas-region">
          <MapCanvas activeCategories={activeCats} />
        </div>
      </div>
    );
  };

  const handleModuleChange = (module) => {
    setActiveModule(module);

    if (module === 'events') {
      setCurrentPage('main');
      setSelectedEventId(null);
    }
  };

  return (
    <div className="app-shell">
      <div className="tab-bar">
        <div className="tab-bar-title">NextQuad</div>
        {[
          { id: 'events', label: 'Events' },
          { id: 'map', label: 'Campus Map' }
        ].map((module) => (
          <button
            key={module.id}
            type="button"
            onClick={() => handleModuleChange(module.id)}
            aria-pressed={activeModule === module.id}
            className={`tab-button ${
              activeModule === module.id ? 'tab-button-active' : ''
            }`}
          >
            {module.label}
          </button>
        ))}
      </div>

      <div className="module-body">{renderActiveModule()}</div>
    </div>
  );
}
