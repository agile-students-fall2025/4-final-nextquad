import { useState } from 'react';
import './FeedCreatePost.css';

export default function FeedCreatePost({ navigateTo }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: ''
  });

  const categories = ['All','General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to backend
    console.log('Creating post with data:', formData);
    alert('Post created successfully!');
    navigateTo('main');
  };

  const selectCategory = (cat) => {
    if (cat === 'All') return;
    setFormData({ ...formData, category: cat });
  };

  return (
    <div className="event-create-container">
      <div className="event-create-header">
        <button
          className="event-create-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back
        </button>
        <h1 className="event-create-title">Create Post</h1>
      </div>

      <form className="event-create-form" onSubmit={handleSubmit}>
        <div className="event-create-image-upload">
          <span style={{ fontSize: '48px' }}>+</span>
          <p>Upload Photo (Optional)</p>
        </div>

        <input
          type="text"
          placeholder="Post Title"
          className="event-create-input"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <textarea
          placeholder="What's on your mind?"
          className="event-create-textarea"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          required
        />

        <div className="event-create-categories">
          <p className="event-create-categories-title">Category</p>
          <div className="event-create-categories-list">
            {categories.filter(c => c !== 'All').map(cat => (
              <button
                key={cat}
                type="button"
                className={formData.category === cat ? 'event-create-category-button-active' : 'event-create-category-button'}
                onClick={() => selectCategory(cat)}
              >
                #{cat}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="event-create-submit-button">
          Publish Post
        </button>
      </form>
    </div>
  );
}

