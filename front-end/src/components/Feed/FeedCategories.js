import './FeedCategories.css';

export default function FeedCategories({ categories = [], selected, onSelect }) {
  const visible = categories.filter(c => c !== 'All');
  return (
    <div className="feed-categories-container">
      <p className="feed-categories-title">Categories</p>
      <div className="feed-categories-list">
        {visible.map(cat => (
          <button
            key={cat}
            type="button"
            className={selected === cat ? 'feed-category-button-active' : 'feed-category-button'}
            onClick={() => onSelect(cat)}
          >
            #{cat}
          </button>
        ))}
      </div>
    </div>
  );
}


