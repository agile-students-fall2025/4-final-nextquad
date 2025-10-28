import { useEffect, useRef, useState, useMemo } from "react";
import "./MapCanvas.css";
import pinPng from "../../assets/campus_map/mapPin.png";
import { POINTS } from "../../data/campus_map/mapPoints";

export default function MapCanvas({ activeCategories }) {
  const [openId, setOpenId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef(null);

  const Z_MIN = 0.75;
  const Z_MAX = 2.0;
  const Z_STEP = 0.25;

  const clamp = (z) => Math.min(Z_MAX, Math.max(Z_MIN, Number(z.toFixed(2))));

  const zoomIn = () => setZoom((z) => clamp(z + Z_STEP));
  const zoomOut = () => setZoom((z) => clamp(z - Z_STEP));
  const zoomReset = () => setZoom(1);

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

  const onDoubleClick = () => zoomIn();

  const visible = useMemo(() => {
    if (!(activeCategories instanceof Set)) return POINTS;
    return POINTS.filter((p) => p.categories?.some((c) => activeCategories.has(c)));
  }, [activeCategories]);

  const onPinClick = (id) => {
    setOpenId((cur) => (cur === id ? null : id));
  };

  const closeCard = () => setOpenId(null);

  return (
    <div className="map-canvas" ref={canvasRef} onDoubleClick={onDoubleClick}>
      <div className="zoom-controls" role="toolbar" aria-label="Map zoom controls">
        <button type="button" className="zoom-btn" onClick={zoomOut} aria-label="Zoom out">-</button>
        <div className="zoom-indicator" aria-live="polite">{Math.round(zoom * 100)}%</div>
        <button type="button" className="zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
        <button type="button" className="zoom-reset" onClick={zoomReset} aria-label="Reset zoom">Reset</button>
      </div>

      <div className="map-inner" style={{ transform: `scale(${zoom})` }}>
        {visible.map((p) => {
          const isOpen = openId === p.id;
          return (
            <div
              key={p.id}
              className={`pin ${isOpen ? "is-open" : ""}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
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
                <div className="pin-info" role="dialog" aria-label={`${p.title} information`}>
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
