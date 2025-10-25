import Header from "./components/Header";
import MapCanvas from "./components/MapCanvas";
import "./index.css"; 

export default function App() {
  return (
    <div className="App" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header/>
      <div style={{ flex: 1 }}>
        <MapCanvas/>
      </div>
    </div>
  );
}
