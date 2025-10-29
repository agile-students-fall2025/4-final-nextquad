import { useMemo, useState } from 'react';
import { mockEvents } from './data/Events/mockEventData';
import { getPostById } from './data/Feed/mockFeedData';
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
// Feed module components
import FeedMain from './components/Feed/FeedMain';
import FeedCreatePost from './components/Feed/FeedCreatePost';
import FeedComments from './components/Feed/FeedComments';
import FeedSavedPosts from './components/Feed/FeedSavedPosts';
import FilterDropdown from './components/campus_map/FilterDropdown';
import { CATEGORIES } from './data/campus_map/mapPoints';
import './components/campus_map/FilterDropdown.css';
import Settings from './components/Settings/Settings';
import ChangePasswordForm from './components/Settings/ChangePassword';

import HelloWindow from './components/log_in/HelloWindow';
import SignIn from './components/log_in/SignIn';
import SignUp from './components/log_in/SignUp';
import ProfileSetup from './components/log_in/ProfileSetup';
import ForgotPassword from './components/log_in/ForgotPassword';
import VerifyCode from './components/log_in/VerifyCode';
import ResetPassword from './components/log_in/ResetPassword';

export default function App() {
  const [activeModule, setActiveModule] = useState('auth');
  const [currentPage, setCurrentPage] = useState('hellowindow');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
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
  const selectedPost = useMemo(
    () => (selectedPostId != null ? getPostById(selectedPostId) : null),
    [selectedPostId]
  );

  const navigateTo = (page, entityId = null) => {
    // Handle module switches (auth, events, map, settings)
    if (['auth', 'events', 'map', 'settings', 'feed'].includes(page)) {
      setActiveModule(page);
  
      // If navigating to 'auth' without specifying a page, default to 'hellowindow'
      if (page === 'auth' && !entityId) {
        setCurrentPage('hellowindow');
      }
  
      // If a specific sub-page is provided, navigate to it
      if (entityId) {
        setCurrentPage(entityId);
      }
  
      return;
    }
  
    // If navigating to 'detail', store the previous page for back navigation
    if (page === 'detail') {
      setPreviousPage(currentPage);
    }
  
    // Default page navigation within a module
    setCurrentPage(page);
    if (activeModule === 'events') {
      setSelectedEventId(entityId);
    } else if (activeModule === 'feed') {
      setSelectedPostId(entityId);
    }
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


  // Auth Module Rendering ✅
  const renderAuthPages = () => {
    switch (currentPage) {
      case 'hellowindow':
        return (
          <HelloWindow
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'signin':
        return (
          <SignIn
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'signup':
        return (
          <SignUp
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'profilesetup':
        return (
          <ProfileSetup setActiveModule={setActiveModule} />
        );
      case 'forgot':
        return (
          <ForgotPassword setCurrentPage={setCurrentPage} />
        );
      case 'verify':
        return (
          <VerifyCode setCurrentPage={setCurrentPage} />
        );
      case 'reset':
        return (
          <ResetPassword setActiveModule={setActiveModule} setCurrentPage={setCurrentPage} />
        );
      default:
        return (
          <HelloWindow
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
          />
        );
    }
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
        return <EventCheckIn navigateTo={navigateTo} event={selectedEvent} />;
      case 'survey':
        return <EventSurvey navigateTo={navigateTo} event={selectedEvent} />;
      case 'analytics':
        return <EventAnalytics navigateTo={navigateTo} event={selectedEvent} />;
      case 'main':
      default:
        return <EventMain navigateTo={navigateTo} />;
    }
  };

  const renderFeedPage = () => {
    switch (currentPage) {
      case 'saved':
        return <FeedSavedPosts navigateTo={navigateTo} />;
      case 'comments':
        return (
          <FeedComments
            post={selectedPost}
            navigateTo={navigateTo}
          />
        );
      case 'create':
        return <FeedCreatePost navigateTo={navigateTo} />;
      case 'main':
      default:
        return <FeedMain navigateTo={navigateTo} />;
    }
  };

  const renderActiveModule = () => {
  // HelloWindow
  if (activeModule === 'auth') return renderAuthPages();

  if (activeModule === 'events') {
    return <div className="events-wrapper">{renderEventPage()}</div>;
  }

  if (activeModule === 'feed') {
    return <div className="events-wrapper">{renderFeedPage()}</div>;
  }

  if (activeModule === 'map') {
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
  }
//SETTINGS MODULE
  // main settings page 
  if (activeModule === 'settings') {
    return (
      <div className="settings-wrapper">
        <Settings navigateTo={(page) => setActiveModule(page)} />
      </div>
    );
  }
  // change password page
  if (activeModule === 'changePassword') {
    return (
      <div className="change-password-wrapper">
        <ChangePasswordForm navigateTo={(page) => setActiveModule(page)} />
      </div>
    );
  }

  return null;
};


  const handleModuleChange = (module) => {
    setActiveModule(module);

    if (module === 'events') {
      setCurrentPage('main');
      setSelectedEventId(null);
    }
    if (module === 'feed') {
      setCurrentPage('main');
      setSelectedPostId(null);
    }
  };

  return (
    <div className="app-shell">
      {activeModule !== 'auth' && (
        <div className="tab-bar">
          <div className="tab-bar-title">NextQuad</div>
          {[
            { id: 'events', label: 'Events' },
            { id: 'feed', label: 'Feed' },
            { id: 'map', label: 'Campus Map' },
            { id: 'settings', label: 'Settings' }
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
      )}
      <div className="module-body">{renderActiveModule()}</div>
    </div>
  );
}
