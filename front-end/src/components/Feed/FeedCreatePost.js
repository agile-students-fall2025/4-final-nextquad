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
  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['All','General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        if (onShowToast) {
          onShowToast({ message: 'Image size must be less than 5MB', type: 'error' });
        }
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        if (onShowToast) {
          onShowToast({ message: 'Please upload a valid image file', type: 'error' });
        }
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview(null);
  };

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
          onClick={() => !imagePreview && document.getElementById('post-image-upload').click()}
          style={{ cursor: imagePreview ? 'default' : 'pointer' }}
        >
          {imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} 
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <span style={{ fontSize: '48px' }}>+</span>
              <p>Upload Photo (Optional)</p>
            </>
          )}
        </div>
        <input
          type="file"
          id="post-image-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />

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

