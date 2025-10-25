import "./MapCanvas.css";
import pinPng from "../assets/mapPin.png";
import {POINTS} from "../data/mapPoints";

export default function MapCanvas() {
  return (
    <div className="map-canvas">
      {POINTS.map((p) => (
        <button
          key={p.id}
          className="pin"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          title={p.title}  
          aria-label={p.title}
          onClick={() => console.log("Clicked:", p.title)} //placeholder for processing
        >
          <img className="pin-img" src={pinPng} alt="" width={24} height={24} />
        </button>
      ))}
    </div>
  );
}
