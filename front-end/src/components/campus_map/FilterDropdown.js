import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "../../data/campus_map/mapPoints";
import "./FilterDropdown.css";

export default function FilterDropdown({ value, onSave }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Set(value));
  const wrapRef = useRef(null);

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
        className="filter-trigger"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        type="button"
      >
        Filter
        <span className={`chev ${open ? "rot" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="filter-panel">
          <div className="filter-list">
            {CATEGORIES.map(c => (
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
