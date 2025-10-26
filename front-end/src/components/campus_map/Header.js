import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <button className="hamburger" type="button" aria-label="Open menu">
        <span />
        <span />
        <span />
      </button>
      <div className="header-title">Campus Map</div>
    </header>
  );
}
