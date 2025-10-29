import './FeedSortBy.css';

export default function FeedSortBy({ options = [], selected, onSelect }) {
  return (
    <div className="feed-sortby-container">
      <p className="feed-sortby-title">Sort</p>
      <div className="feed-sortby-list">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={selected === opt ? 'feed-sortby-button-active' : 'feed-sortby-button'}
            onClick={() => onSelect(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}


