import { useEffect, useState, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import "./MapCanvas.css";
import { getMapPoints } from "../../services/api";

// Default center for NYU campus (Washington Square Park area)
const DEFAULT_CENTER = {
  lat: 40.7308,
  lng: -73.9973
};

// Default map options
const mapContainerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "60vh"
};

const defaultOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

export default function MapCanvas({ activeCategories, searchQuery }) {
  const [openId, setOpenId] = useState(null);
  const [points, setPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [pendingLink, setPendingLink] = useState(null);

  // Get Google Maps API key from environment
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey || '',
    id: 'google-map-script'
  });

  // Inject styles to override Google Maps InfoWindow defaults
  useEffect(() => {
    const styleId = 'map-infowindow-overrides';
    // Remove existing style if it exists to ensure fresh injection
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .gm-style .gm-style-iw-c,
      .gm-style .gm-style-iw-d,
      .gm-style .gm-style-iw,
      .gm-style .gm-style-iw-c > div,
      .gm-style .gm-style-iw-c > div > div,
      .gm-style .gm-style-iw-d > div,
      .gm-style-iw-t,
      .gm-style-iw-t::after,
      .gm-style-iw-t::before {
        background: #fff !important;
        background-color: #fff !important;
      }
      .gm-style .gm-style-iw-c {
        padding: 0 !important;
        border-radius: 12px !important;
        max-width: 320px !important;
      }
      .gm-style .gm-style-iw-d {
        overflow: visible !important;
        max-width: 320px !important;
      }
      @media (max-width: 480px) {
        .gm-style .gm-style-iw-c,
        .gm-style .gm-style-iw-d {
          max-width: 280px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  // Apply white background directly to InfoWindow when it opens
  useEffect(() => {
    if (!openId) return;

    const applyWhiteBackground = () => {
      // Find all InfoWindow elements and force white background using inline styles
      // Inline styles have higher specificity than CSS classes
      const infoWindows = document.querySelectorAll('.gm-style-iw-c, .gm-style-iw-d, .gm-style-iw, .gm-style-iw-c > div, .gm-style-iw-d > div');
      infoWindows.forEach((el) => {
        if (el) {
          el.style.background = '#fff';
          el.style.backgroundColor = '#fff';
        }
      });
    };

    // Apply immediately and also after delays to catch dynamically created elements
    applyWhiteBackground();
    const timeout1 = setTimeout(applyWhiteBackground, 50);
    const timeout2 = setTimeout(applyWhiteBackground, 200);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [openId]);

  // Reset state when component mounts/unmounts
  useEffect(() => {
    // Reset to defaults when component mounts
    setOpenId(null);
    setCenter(DEFAULT_CENTER);
    
    return () => {
      // Cleanup on unmount
      setOpenId(null);
      setPoints([]);
      setMap(null);
    };
  }, []);

  // Handle Escape key to close confirmation modal
  useEffect(() => {
    if (!pendingLink) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setPendingLink(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [pendingLink]);

  // Load points from backend when filters/search change
  useEffect(() => {
    (async () => {
      try {
        const params = {};
        if (activeCategories instanceof Set && activeCategories.size > 0) {
          params.categories = [...activeCategories].join(',');
        }
        if (searchQuery) params.search = searchQuery;
        const data = await getMapPoints(params);
        console.log('Map data received:', data);
        
        // Handle different response formats
        let pointsData = [];
        if (data && data.data) {
          pointsData = Array.isArray(data.data) ? data.data : [];
        } else if (Array.isArray(data)) {
          pointsData = data;
        }
        
        console.log('Points to display:', pointsData.length);
        if (pointsData.length > 0) {
          console.log('Sample point:', pointsData[0]);
          
          // Check if all points have the same coordinates (indicates geocoding issue)
          const uniqueCoords = new Set(pointsData.map(p => `${p.latitude},${p.longitude}`));
          console.log(`Unique coordinate pairs: ${uniqueCoords.size} out of ${pointsData.length} points`);
          if (uniqueCoords.size === 1 && pointsData.length > 1) {
            console.warn('⚠️  WARNING: All points have the same coordinates! This means geocoding is failing.');
            console.warn('Check that GOOGLE_MAPS_API_KEY is set in back-end/.env and Geocoding API is enabled.');
          }
        }
        
        setPoints(pointsData);
        
        // Auto-open first matching result when searching
        if (searchQuery && pointsData.length > 0) {
          setOpenId(pointsData[0]?.id ?? null);
          // Center map on first result
          if (pointsData[0]?.latitude && pointsData[0]?.longitude) {
            setCenter({
              lat: pointsData[0].latitude,
              lng: pointsData[0].longitude
            });
          }
        } else {
          setOpenId(null);
        }
      } catch (e) {
        console.error('Failed to load map points', e);
        console.error('Error details:', e.message, e.stack);
      }
    })();
  }, [activeCategories, searchQuery]);

  const onMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onMarkerClick = (pointId) => {
    setOpenId((cur) => (cur === pointId ? null : pointId));
  };

  const handleLearnMore = (link) => {
    if (!link || !link.trim()) return;
    setPendingLink(link.trim());
  };

  const handleConfirmRedirect = () => {
    if (!pendingLink) return;
    
    // Ensure the link has a protocol
    let url = pendingLink;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    setPendingLink(null);
  };

  const handleCancelRedirect = () => {
    setPendingLink(null);
  };

  const visible = useMemo(() => points, [points]);

  // Show error if API key is missing
  if (!googleMapsApiKey) {
    return (
      <div className="map-canvas map-error">
        <div className="map-error-message">
          <h3>Google Maps API Key Required</h3>
          <p>Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file</p>
        </div>
      </div>
    );
  }

  // Show loading state while script is loading
  if (!isLoaded) {
    return (
      <div className="map-canvas">
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  // Show error if script failed to load
  if (loadError) {
    return (
      <div className="map-canvas map-error">
        <div className="map-error-message">
          <h3>Error Loading Google Maps</h3>
          <p>Failed to load Google Maps script. Please check your API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-canvas">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          options={defaultOptions}
          onLoad={onMapLoad}
        >
          {visible.length === 0 && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000
            }}>
              <p>No locations found. Check console for details.</p>
            </div>
          )}
          {visible.map((point) => {
            // Validate point has required fields
            if (!point || !point.id || !point.title) {
              console.warn('Invalid point - missing id or title:', point);
              return null;
            }
            
            // Ensure coordinates are valid numbers
            const lat = typeof point.latitude === 'number' && !isNaN(point.latitude) 
              ? point.latitude 
              : 40.7308; // Default NYU coordinates
            const lng = typeof point.longitude === 'number' && !isNaN(point.longitude) 
              ? point.longitude 
              : -73.9973; // Default NYU coordinates
            
            return (
              <Marker
                key={point.id}
                position={{
                  lat: lat,
                  lng: lng
                }}
                onClick={() => onMarkerClick(point.id)}
                title={point.title}
              >
                {openId === point.id && (
                  <InfoWindow
                    onCloseClick={() => setOpenId(null)}
                    position={{
                      lat: lat,
                      lng: lng
                    }}
                    options={{
                      maxWidth: 320,
                      disableAutoPan: false
                    }}
                  >
                    <div className="pin-info">
                      {point.categories && point.categories.length > 0 && (
                        <div className="pin-info-categories">
                          {point.categories.map((category, index) => (
                            <span key={index} className="category-tag">
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
                      <h4 className="pin-info-title">
                        {point.title}
                      </h4>
                      {point.desc && (
                        <p className="pin-info-desc">
                          {point.desc}
                        </p>
                      )}
                      {point.address && (
                        <div className="meta">
                          <strong>Address:</strong> {point.address}
                        </div>
                      )}
                      {point.link && point.link.trim() && (
                        <div className="pin-info-actions">
                          <button
                            type="button"
                            className="pin-info-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLearnMore(point.link);
                            }}
                          >
                            Learn More
                          </button>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
        </GoogleMap>
        
        {pendingLink && (
          <div className="confirm-modal-backdrop" onClick={handleCancelRedirect}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h4>External Link</h4>
              <p style={{ margin: '8px 0 16px', color: '#4a4a4a' }}>
                You will be redirected to an outside website. Do you want to continue?
              </p>
              <div className="confirm-modal-actions">
                <button
                  className="confirm-modal-btn secondary"
                  onClick={handleCancelRedirect}
                >
                  Cancel
                </button>
                <button
                  className="confirm-modal-btn"
                  onClick={handleConfirmRedirect}
                  style={{
                    background: 'var(--brand)',
                    color: '#fff',
                    boxShadow: '0 6px 16px rgba(107, 70, 193, 0.25)'
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
