import { useState } from 'react';
import { createPost } from '../../services/api';
import './FeedCreatePost.css';

export default function FeedCreatePost({ navigateTo, onShowToast }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const categories = ['All','General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category) {
      setCategoryError(true);
      // Scroll to category section
      document.querySelector('.event-create-categories')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      return;
    }

    setCategoryError(false);
    setSubmitting(true);
    try {
      await createPost({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        image: formData.image || null
      });
      
      // Show success toast
      if (onShowToast) {
        onShowToast({ message: 'Post created successfully!', type: 'success' });
      }
      
      navigateTo('main');
    } catch (err) {
      console.error('Error creating post:', err);
      
      // Show error toast
      if (onShowToast) {
        onShowToast({ message: 'Failed to create post. Please try again.', type: 'error' });
      } else {
        alert('Failed to create post. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectCategory = (cat) => {
    if (cat === 'All') return;
    setFormData({ ...formData, category: cat });
    setCategoryError(false); // Clear error when category is selected
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
        <div
          className="event-create-image-upload"
          onClick={() => alert('Photo uploads not supported yet.')}
        >
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

        <div className={`event-create-categories ${categoryError ? 'error' : ''}`}>
          <p className="event-create-categories-title">
            Category {categoryError && <span className="category-required-text">*Required</span>}
          </p>
          {categoryError && (
            <p className="category-error-message">Please select a category for your post</p>
          )}
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

        <button type="submit" className="event-create-submit-button" disabled={submitting}>
          {submitting ? 'Publishing...' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
}

