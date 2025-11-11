import { useEffect, useRef, useState } from "react";
import { getMapCategories } from "../../services/api";
import "./FilterDropdown.css";

export default function FilterDropdown({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Set(value));
  const [categories, setCategories] = useState([]);
  const wrapRef = useRef(null);

  // Load categories from backend
  useEffect(() => {
    (async () => {
      try {
        const data = await getMapCategories();
        const arr = Array.isArray(data) ? data : (data?.data ?? []);
        setCategories(arr);
      } catch (e) {
        console.error("Failed to load map categories", e);
      }
    })();
  }, []);

  //Close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (open && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  //Sync draft when opening or when parent changes
  useEffect(() => {
    setDraft(new Set(value));
  }, [value, open]);

  const toggle = (id) => {
    const next = new Set(draft);
    next.has(id) ? next.delete(id) : next.add(id);
    setDraft(next);
  };

  const handleSave = () => {
    onSave(new Set(draft)); 
    setOpen(false);//close dropdown menu
  };

  return (
    <div className="filter-wrap" ref={wrapRef}>
      <button
        className="map-main-filter-button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        // type="button"
      >
        Filter 
        <span className={`chev ${open ? "rot" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-list">
            {categories.map(c => (
              <label key={c.id} className="filter-item">
                <input
                  type="checkbox"
                  checked={draft.has(c.id)}
                  onChange={() => toggle(c.id)}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <div className="filter-actions">
            <button className="btn primary" type="button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
