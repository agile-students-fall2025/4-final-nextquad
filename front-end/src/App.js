import { useMemo, useState, useEffect } from 'react';
import { getEventById, getPostById } from './services/api';
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
import Toast from './components/Feed/Toast';
import FeedSavedPosts from './components/Feed/FeedSavedPosts';
import FeedMyPosts from './components/Feed/FeedMyPosts';
import FilterDropdown from './components/campus_map/FilterDropdown';
import { getMapCategories } from './services/api';
import './components/campus_map/FilterDropdown.css';
import Settings from './components/Settings/Settings';
import ChangePasswordForm from './components/Settings/ChangePassword';
import PrivacyPolicy from './components/Settings/PrivacyPolicy';
import NotificationSettings from './components/Settings/NotificationSettings';

import HelloWindow from './components/log_in/HelloWindow';
import SignIn from './components/log_in/SignIn';
import SignUp from './components/log_in/SignUp';
import ProfileSetup from './components/log_in/ProfileSetup';
import ForgotPassword from './components/log_in/ForgotPassword';
import VerifyCode from './components/log_in/VerifyCode';
import ResetPassword from './components/log_in/ResetPassword';
import AdminSignin from './components/Admin/AdminSignIn';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminNotifications from './components/Admin/AdminNotifications';
import AdminEmergencyAlert from './components/Admin/AdminEmergencyAlert';
import AdminReportUser from './components/Admin/AdminReportUser';
import AdminFeedMain from './components/Admin/AdminFeedMain';


export default function App() {
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [activeModule, setActiveModule] = useState('auth');
  const [currentPage, setCurrentPage] = useState('hellowindow');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previousPage, setPreviousPage] = useState('main'); // Track where user came from
  const [returnToPage, setReturnToPage] = useState('main'); // Track where to return from comments
  const [isAdmin, setIsAdmin] = useState(false);

  // TODO Sprint 2: This will be managed by backend session/auth
  // For now, we track RSVP'd events in local state
  const [rsvpedEventIds, setRsvpedEventIds] = useState([2, 3]); // Mock: user has RSVP'd to events 2 and 3
  const [activeCats, setActiveCats] = useState(new Set());
  const [toast, setToast] = useState(null); // { message, type }

  // Check if user is logged in on app mount (for page refresh persistence)
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const lastModule = localStorage.getItem('lastModule');
    const lastPage = localStorage.getItem('lastPage');
    const lastEventId = localStorage.getItem('lastEventId');
    const lastPostId = localStorage.getItem('lastPostId');
    const isAdminUser = localStorage.getItem('isAdmin') === 'true';

    if (token) {
      // User has a valid token, restore their previous location
      setIsAdmin(isAdminUser);
      
      if (isAdminUser) {
        setActiveModule('admin');
      } else if (lastModule) {
        setActiveModule(lastModule);
        if (lastPage) setCurrentPage(lastPage);
        if (lastEventId) setSelectedEventId(parseInt(lastEventId, 10));
        if (lastPostId) setSelectedPostId(parseInt(lastPostId, 10));
      } else {
        // Default to feed if no last module stored
        setActiveModule('feed');
        setCurrentPage('main');
      }
    }
    // If no token, user stays on auth page (already the default)
  }, []);

  // Save current location to localStorage whenever it changes (for refresh persistence)
  useEffect(() => {
    if (activeModule !== 'auth') {
      localStorage.setItem('lastModule', activeModule);
      localStorage.setItem('lastPage', currentPage);
      if (selectedEventId) localStorage.setItem('lastEventId', selectedEventId);
      if (selectedPostId) localStorage.setItem('lastPostId', selectedPostId);
    }
  }, [activeModule, currentPage, selectedEventId, selectedPostId]);

  // Load categories once and set all selected by default
  useEffect(() => {
    (async () => {
      try {
        const cats = await getMapCategories();        // [{id, label}]
        setActiveCats(new Set(cats.map(c => c.id)));  // select all
      } catch (e) {
        console.error('Failed to load map categories', e);
      }
    })();
  }, []);
  
  const onMapSearchChange = (e) => {
    const v = e.target.value;
    setMapSearchTerm(v);
    setMapSearchQuery(v.trim().length >= 2 ? v.trim() : "");
  };
  
  // Fetch event details from backend when selectedEventId changes
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (selectedEventId) {
        try {
          const response = await getEventById(selectedEventId);
          setSelectedEvent(response.data);
        } catch (error) {
          console.error('Error fetching event details:', error);
          setSelectedEvent(null);
        }
      } else {
        setSelectedEvent(null);
      }
    };
    
    fetchEventDetails();
  }, [selectedEventId]);

  // Fetch selected post details for Feed comments
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (selectedPostId) {
        try {
          const response = await getPostById(selectedPostId);
          setSelectedPost(response.data);
        } catch (error) {
          console.error('Error fetching post details:', error);
          setSelectedPost(null);
        }
      } else {
        setSelectedPost(null);
      }
    };
    
    fetchPostDetails();
  }, [selectedPostId]);

  const navigateTo = (page, entityId = null, returnTo = null) => {
    // Handle module switches (auth, events, map, settings)
    if (['auth', 'events', 'map', 'settings', 'feed', 'changePassword', 'privacyPolicy', 'notificationSettings'].includes(page)) {
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

    // If navigating to 'comments', store returnTo page for back navigation
    if (page === 'comments' && returnTo) {
      setReturnToPage(returnTo);
    }
  
    // Default page navigation within a module
    setCurrentPage(page);
    if (activeModule === 'events') {
      setSelectedEventId(entityId);
    } else if (activeModule === 'feed' || activeModule === 'admin') {
      setSelectedPostId(entityId);
    }
  };

  const handleRSVP = async (eventId) => {
    // Call backend API to RSVP
    try {
      const { rsvpToEvent } = await import('./services/api');
      await rsvpToEvent(eventId);
      
      if (!rsvpedEventIds.includes(eventId)) {
        setRsvpedEventIds((prev) => [...prev, eventId]);
      }
      
      navigateTo('rsvp-confirm', eventId);
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      // Don't show alert - the event might be past or user not logged in
      // Error will be shown on the detail page
    }
  };


  // Auth Module Rendering ✅
  const renderAuthPages = () => {
    switch (currentPage) {
      case 'hellowindow':
        return (
          <HelloWindow
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
            setIsAdmin={setIsAdmin}
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
      case 'adminSignin':
        return (
          <AdminSignin setActiveModule={setActiveModule} setCurrentPage={setCurrentPage} setIsAdmin={setIsAdmin} />
        );
      default:
        return (
          <HelloWindow
            setActiveModule={setActiveModule}
            setCurrentPage={setCurrentPage}
            setIsAdmin ={setIsAdmin}
          />
        );
    }
  };

const renderAdminPages = () => {
  switch (currentPage) {
    case 'adminNotifications':
      return <AdminNotifications navigateTo={navigateTo} />;
    case 'adminReportUser':
      return <AdminReportUser navigateTo={navigateTo} />;
    case 'adminEmergencyAlert':
      return <AdminEmergencyAlert navigateTo={navigateTo} />;
    case 'adminFeed':
      return <AdminFeedMain navigateTo={navigateTo} />;
    case 'comments':
      return (
        <FeedComments
          post={selectedPost}
          navigateTo={navigateTo}
          returnToPage={'adminFeed'}
          isAdmin={true}
        />
      );
    case 'dashboard': 
    default:
      return <AdminDashboard navigateTo={navigateTo} />;
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
        return <FeedSavedPosts navigateTo={navigateTo} onShowToast={setToast} />;
      case 'myposts':
        return <FeedMyPosts navigateTo={navigateTo} onShowToast={setToast} />;
      case 'comments':
        return (
          <FeedComments
            post={selectedPost}
            navigateTo={navigateTo}
            returnToPage={returnToPage}
            onShowToast={setToast}
          />
        );
      case 'create':
        return <FeedCreatePost navigateTo={navigateTo} onShowToast={setToast} />;
      case 'main':
      default:
        return <FeedMain navigateTo={navigateTo} onShowToast={setToast} />;
    }
  };

  const renderCampusMapPage = () => {
    switch (currentPage) {
      default:
        return (
          <div className="events-wrapper">
            <Header />
            <div className="event-main-controls">
              <div className="event-main-filter-row">
                {/* Filter */}
                <div className="event-main-sort-container">
                  <FilterDropdown
                    value={activeCats}
                    onSave={(nextSet) => setActiveCats(new Set(nextSet))}
                  />
                </div>
                {/* Search Bar */}
                <div className="event-main-sort-container">
                  <input
                    type="text"
                    placeholder="Search places..."
                    className="event-main-search-input"
                    value={mapSearchTerm}
                    onChange={onMapSearchChange}
                  />
                </div>
              </div>
            </div>

            <div className="map-content">
              <div className="map-canvas-card">
                <MapCanvas activeCategories={activeCats} searchQuery={mapSearchQuery}/>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderActiveModule = () => {
  // HelloWindow
  if (activeModule === 'auth') return renderAuthPages();
  if (activeModule === 'admin') return renderAdminPages();


  if (activeModule === 'events') {
    return <div className="events-wrapper">{renderEventPage()}</div>;
  }

  if (activeModule === 'feed') {
    return <div className="events-wrapper">{renderFeedPage()}</div>;
  }

  if (activeModule === 'map') {
    return <div className="events-wrapper">{renderCampusMapPage()}</div>;
  }
    
//SETTINGS MODULE
  // main settings page 
  if (activeModule === 'settings') {
    return (
      <div className="settings-wrapper">
        <Settings navigateTo={navigateTo} />
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
  // privacy policy page
  if (activeModule === 'privacyPolicy') {
  return (
    <div className="change-password-wrapper">
      <PrivacyPolicy navigateTo={(page) => setActiveModule(page)} />
    </div>
    );
  }
  // notification settings page
  if (activeModule === 'notificationSettings') {
    return (
      <div className="notification-settings-wrapper">
        <NotificationSettings navigateTo={(page) => setActiveModule(page)} />
      </div>
    );
  } 


  return null;
};


  const handleModuleChange = (module) => {
    setActiveModule(module);
    setIsMobileMenuOpen(false);

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
      {activeModule !== 'auth' && activeModule !== 'admin' && (
        <>
          {/* Desktop Tab Bar */}
          <div className="tab-bar desktop-only">
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

          {/* Mobile Topbar */}
          <div className="mobile-topbar mobile-only">
            <button
              type="button"
              className="hamburger-button"
              aria-label="Open navigation"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
              <span className="hamburger-bar" />
            </button>
            <div className="mobile-topbar-title">NextQuad</div>
          </div>

          {/* Mobile Drawer */}
          <div 
            className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={(e) => {
              // Close drawer if clicking on drawer background (not on buttons)
              if (!e.target.classList.contains('mobile-drawer-item')) {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            {[
              { id: 'events', label: 'Events' },
              { id: 'feed', label: 'Feed' },
              { id: 'map', label: 'Campus Map' },
              { id: 'settings', label: 'Settings' }
            ].map((module) => (
              <button
                key={module.id}
                type="button"
                className={`mobile-drawer-item ${activeModule === module.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleModuleChange(module.id);
                }}
              >
                {module.label}
              </button>
            ))}
          </div>
          {isMobileMenuOpen && (
            <div
              className="mobile-drawer-overlay mobile-only"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden
            />
          )}
        </>
      )}
      <div className="module-body">{renderActiveModule()}</div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
