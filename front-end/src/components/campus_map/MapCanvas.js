import { useEffect, useRef, useState, useMemo } from "react";
import "./MapCanvas.css";
import pinPng from "../../assets/campus_map/mapPin.png";
import { getMapPoints } from "../../services/api";

export default function MapCanvas({ activeCategories, searchQuery }) {
  const [openId, setOpenId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [points, setPoints] = useState([]);
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const Z_MIN = 0.55;
  const Z_MAX = 2.0;
  const Z_STEP = 0.15;

  const clamp = (z) => Math.min(Z_MAX, Math.max(Z_MIN, Number(z.toFixed(2))));

  const zoomIn = () => setZoom((z) => clamp(z + Z_STEP));
  const zoomOut = () => setZoom((z) => clamp(z - Z_STEP));
  const zoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan and drag handlers
  const handleMouseDown = (e) => {
    const target = e.target;
    if (
      target.closest('.pin-btn') ||
      target.closest('.pin-info') ||
      target.closest('.zoom-controls') ||
      target.closest('button') ||
      target.closest('a')
    ) {
      return;
    }
    
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
    e.preventDefault();
  };

  // Load points from backend when filters/search change
  useEffect(() => {
    (async () => {
      try {
        const params = {};
        if (activeCategories instanceof Set && activeCategories.size > 0) {
          // backend expects comma-separated list
          params.categories = [...activeCategories].join(',');
        }
        if (searchQuery) params.search = searchQuery;
        const data = await getMapPoints(params); // expect array of points
        setPoints(data.data || data);
        // Auto-open first matching result when searching
        if (searchQuery) setOpenId(data?.[0]?.id ?? null);
        else setOpenId(null);
      } catch (e) {
        console.error('Failed to load map points', e);
      }
    })();
  }, [activeCategories, searchQuery]);

  // Close the info card when clicking outside the canvas
  useEffect(() => {
    const onDocClick = (e) => {
      if (!canvasRef.current) return;
      if (!canvasRef.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Keyboard shortcuts: +/-
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-") zoomOut();
      else if (e.key === "0") zoomReset();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Mouse move and up handlers for dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      setPan({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const onDoubleClick = () => zoomIn();

  const visible = useMemo(() => points, [points]);

  const onPinClick = (id) => {
    setOpenId((cur) => (cur === id ? null : id));
  };

  const closeCard = () => setOpenId(null);

  return (
    <div 
      className={`map-canvas ${isDragging ? 'is-dragging' : ''}`}
      ref={canvasRef} 
      onDoubleClick={onDoubleClick}
      onMouseDown={handleMouseDown}
    >
      <div className="zoom-controls" role="toolbar" aria-label="Map zoom controls">
        <button type="button" className="zoom-btn" onClick={zoomOut} aria-label="Zoom out">-</button>
        <div className="zoom-indicator" aria-live="polite">{Math.round(zoom * 100)}%</div>
        <button type="button" className="zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" className="zoom-reset" onClick={zoomReset} aria-label="Reset zoom">Reset</button>
      </div>

      <div className="map-inner" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
        {visible.map((p) => {const isOpen = openId === p.id;
          return (
            <div
              key={p.id}
              className={`pin ${isOpen ? "is-open" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%`}}
            >
              <button
                type="button"
                className="pin-btn"
                title={p.title}
                aria-label={p.title}
                onClick={() => onPinClick(p.id)}
              >
                <img className="pin-img" src={pinPng} alt="" width={24} height={24} />
              </button>

              {isOpen && (
                <div 
                  className="pin-info" 
                  role="dialog" 
                  aria-label={`${p.title} information`}
                  style={{ 
                    transform: `scale(${1 / zoom}) translate(calc(-50% + var(--pin-info-shift-x)), calc(-100% + var(--pin-info-shift-y)))`,
                    transformOrigin: 'center bottom'
                  }}
                >
                  <button
                    type="button"
                    className="pin-info-close"
                    aria-label="Close"
                    onClick={closeCard}
                  >
                    X
                  </button>

                  <h4 className="pin-info-title">{p.title}</h4>
                  {p.hours ? <div className="meta">Hours: {p.hours}</div> : null}
                  <p className="pin-info-desc">
                    {p.desc ?? "Lorem ipsum dolor sit amet, consectetur adipisicing elit."}
                  </p>

                  <div className="pin-info-actions">
                    <a
                      className="pin-info-link-btn"
                      href={""}  // placeholder link
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Reserve at ${p.title}`}
                    >
                      Reserve
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
