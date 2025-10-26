import {useEffect, useRef, useState} from "react";
import "./MapCanvas.css";
import pinPng from "../../assets/campus_map/mapPin.png";
import {POINTS} from "../../data/campus_map/mapPoints";

export default function MapCanvas() {
  const [openId, setOpenId] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!canvasRef.current) return;
      if (!canvasRef.current.contains(e.target)) setOpenId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onPinClick = (id) => {
    setOpenId((cur) => (cur === id ? null : id));
  };
  
  return (
    <div className="map-canvas" ref={canvasRef}>
      {POINTS.map((p) => {
        const isOpen = openId === p.id;

        return (
          <div
            key={p.id}
            className="pin"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <button
              type="button"
              className="pin-btn"
              title={p.title}
              aria-label={p.title}
              onClick={() => onPinClick(p.id)}
              style={{ border: 0, background: "transparent", padding: 0, cursor: "pointer" }}
            >
              <img className="pin-img" src={pinPng} alt="" width={24} height={24} />
            </button>

            {isOpen && (
              <div className="pin-info" role="dialog" aria-label={`${p.title} info`}>
                <h4>{p.title}</h4>
                <div className="meta">Hours: {p.hours}</div>
                <p>{p.desc}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
