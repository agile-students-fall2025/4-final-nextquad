import { useState } from 'react';
import { createPost } from '../../services/api';
import './FeedCreatePost.css';

export default function FeedCreatePost({ navigateTo, onShowToast }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = ['All','General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      if (onShowToast) {
        onShowToast({ message: 'Maximum 5 images allowed per post', type: 'error' });
      }
      return;
    }

    const validFiles = [];

    for (const file of files) {
      // Validate file size (max 5MB per image)
      if (file.size > 5 * 1024 * 1024) {
        if (onShowToast) {
          onShowToast({ message: 'Each image must be less than 5MB. Please choose a smaller image.', type: 'error' });
        }
        continue;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        if (onShowToast) {
          onShowToast({ message: 'Please upload valid image files only', type: 'error' });
        }
        continue;
      }

      // Convert to base64 - wrap in Promise to wait for it
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      validFiles.push(base64String);
    }

    // Update state with all valid files at once
    if (validFiles.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
      setImagePreviews(prev => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
        images: formData.images.length > 0 ? formData.images : null
      });
      
      // Show success toast
      if (onShowToast) {
        onShowToast({ message: 'Post created successfully!', type: 'success' });
      }
      
      navigateTo('main');
    } catch (err) {
      console.error('Error creating post:', err);
      
      // Show error toast
      onShowToast({ message: 'Failed to create post. Please try again.', type: 'error' });
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
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '15px', fontWeight: '500', marginBottom: '12px', color: '#333' }}>
            Upload Photos (Optional - Max 5)
          </p>
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
              marginBottom: '12px'
            }}>
              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`} 
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: '4px',
                    left: '4px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {index + 1}/{imagePreviews.length}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          {imagePreviews.length < 5 && (
            <div 
              className="event-create-image-upload" 
              onClick={() => document.getElementById('post-image-upload').click()}
              style={{ cursor: 'pointer', height: '120px' }}
            >
              <span style={{ fontSize: '36px' }}>+</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                {imagePreviews.length === 0 ? 'Add Photos' : `Add More (${imagePreviews.length}/5)`}
              </p>
            </div>
          )}
        </div>
        <input
          type="file"
          id="post-image-upload"
          accept="image/*"
          multiple
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

