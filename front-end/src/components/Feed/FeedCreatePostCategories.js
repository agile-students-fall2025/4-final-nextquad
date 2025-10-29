import './FeedCreatePostCategories.css';

export default function FeedCreatePostCategories({ categories = [], selected = [], onToggle }) {
  const visible = categories.filter(c => c !== 'All');
  return (
    <div className="feed-createpost-categories">
      <p className="feed-createpost-categories-title">Categories</p>
      <div className="feed-createpost-categories-list">
        {visible.map(cat => (
          <button
            key={cat}
            type="button"
            className={selected.includes(cat) ? 'feed-createpost-category-button-active' : 'feed-createpost-category-button'}
            onClick={() => onToggle(cat)}
          >
            #{cat}
          </button>
        ))}
      </div>
    </div>
  );
}


