import './FeedSavedPosts.css'; // Reuse the same styles
import { useState, useEffect, useRef } from 'react';
import { getMyPosts, togglePostLike, deletePost } from '../../services/api';
import { updatePost } from '../../services/api';
import ImageModal from './ImageModal';
import ImageCarousel from './ImageCarousel';

export default function FeedMyPosts({ navigateTo }) {
    const [editingPost, setEditingPost] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', image: '', category: '', resolved: false });
    const [savingEdit, setSavingEdit] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const menuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const isFetchingRef = useRef(false);
  const feedCategories = ['General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];
  const [editCategory, setEditCategory] = useState('');

  // Prevent background scroll when edit modal is open
  useEffect(() => {
    if (editingPost || deleteTarget) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [editingPost, deleteTarget]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    if (openMenuId !== null || showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId, showSortMenu]);

  useEffect(() => {
    const fetchMyPosts = async (cursor = null, searchQuery = null) => {
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        if (!cursor) {
          setLoading(true);
          setMyPosts([]);
          setNextCursor(null);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const params = {
          limit: 10,
          ...(cursor && { before: cursor }),
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await getMyPosts(params);

        if (cursor) {
          setMyPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
        } else {
          setMyPosts(response.data || []);
        }

        setNextCursor(response.nextCursor || null);
      } catch (err) {
        console.error('Error fetching my posts:', err);
        setError('Failed to load your posts. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    };

    fetchMyPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const response = await togglePostLike(postId);
      
      // Update the post in the local state
      setMyPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likes: response.data.likes, isLikedByUser: response.data.isLikedByUser }
            : post
        )
      );
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const promptDeletePost = (post) => {
    setDeleteTarget(post);
    setOpenMenuId(null);
  };

  const cancelDeletePost = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDeletePost = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const postId = deleteTarget.id;
    try {
      const response = await deletePost(postId);
      
      if (response && response.success) {
        setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setOpenMenuId(null);
        if (window.updateFeedMainAfterDelete) {
          window.updateFeedMainAfterDelete(postId);
        }
        setDeleteTarget(null);
      } else {
        alert(`Failed to delete post: ${response?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert(`Failed to delete post: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Load more posts with cursor pagination
  const handleLoadMore = async () => {
    if (nextCursor) {
      const searchQuery = isSearchMode ? searchTerm : null;
      isFetchingRef.current = true;
      setLoadingMore(true);

      try {
        const params = {
          limit: 10,
          before: nextCursor,
          ...(searchQuery && { search: searchQuery }),
        };

        const response = await getMyPosts(params);
        setMyPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
        setNextCursor(response.nextCursor || null);
      } catch (err) {
        console.error('Error loading more posts:', err);
      } finally {
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    }
  };

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearchMode(true);
        isFetchingRef.current = true;
        setLoading(true);
        setMyPosts([]);
        setNextCursor(null);
        setError(null);

        try {
          const response = await getMyPosts({
            search: searchTerm,
            limit: 10,
          });

          setMyPosts(response.data || []);
          setNextCursor(response.nextCursor || null);
        } catch (err) {
          console.error('Error searching my posts:', err);
          setError('Failed to search posts. Please try again.');
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      } else {
        if (isSearchMode) {
          setIsSearchMode(false);
          isFetchingRef.current = true;
          setLoading(true);
          setMyPosts([]);
          setNextCursor(null);
          setError(null);

          try {
            const response = await getMyPosts({ limit: 10 });
            setMyPosts(response.data || []);
            setNextCursor(response.nextCursor || null);
          } catch (err) {
            console.error('Error fetching my posts:', err);
            setError('Failed to load posts. Please try again.');
          } finally {
            setLoading(false);
            isFetchingRef.current = false;
          }
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, isSearchMode]);

  // Edit handlers (moved to top-level)
  const handleEditPost = (post) => {
    setEditingPost(post);
    const postImages = (post.images && post.images.length > 0) ? post.images : (post.image ? [post.image] : []);
    setEditForm({
      title: post.title,
      content: post.content,
      images: postImages,
      category: post.category,
      resolved: !!post.resolved // Always boolean
    });
    setEditCategory(post.category);
    setOpenMenuId(null);
  };

  const handleEditImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    const currentCount = editForm.images?.length || 0;
    const remaining = 5 - currentCount;
    if (files.length > remaining) {
      alert(`You can only add ${remaining} more image(s). Maximum is 5.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Each image must be less than 5MB');
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload valid image files only');
        continue;
      }

      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      validFiles.push(base64String);
    }

    if (validFiles.length > 0) {
      setEditForm(prev => {
        const newImages = [...(prev.images || []), ...validFiles];
        console.log('✅ Added images, new count:', newImages.length);
        return { ...prev, images: newImages };
      });
    }
  };

  const handleEditRemoveImage = (index) => {
    setEditForm(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      console.log('🗑️ Removed image at index', index, 'new count:', newImages.length);
      return { ...prev, images: newImages };
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, checked } = e.target;
    setEditForm(form => ({
      ...form,
      [name]: name === 'resolved' ? checked : value
    }));
    if (name === 'category') setEditCategory(value);
  };
  const handleEditCategoryClick = (cat) => {
    setEditForm(form => ({ ...form, category: cat }));
    setEditCategory(cat);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingPost) return;
    setSavingEdit(true);
    try {
      const payload = {
        title: editForm.title,
        content: editForm.content,
        images: editForm.images?.length > 0 ? editForm.images : null,
        category: editForm.category,
        resolved: editForm.resolved
      };
      console.log('📤 Submitting post update with payload:', { ...payload, images: payload.images ? `[${payload.images.length} images]` : 'null' });
      const updated = await updatePost(editingPost.id, payload);
      console.log('✅ Post updated successfully');
      setMyPosts(prevPosts => prevPosts.map(post => post.id === editingPost.id ? updated.data : post));
      // Also update main feed if available
      if (window.updateFeedMainPost) {
        window.updateFeedMainPost(updated.data);
      }
      setEditingPost(null);
    } catch (err) {
      console.error('❌ Failed to update post:', err);
      alert('Failed to update post.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEditModalClose = () => {
    setEditingPost(null);
  };

  const toggleMenu = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
  };

  // Posts are now sorted and filtered server-side, just use directly
  const sortedPosts = myPosts;

  return (
    <div className="feed-saved-container">
      <div className="feed-saved-nav-bar">
        <button
          className="feed-saved-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back to Feed
        </button>
        <h2 className="feed-saved-nav-title">
          My Posts
        </h2>
        <button 
          className="feed-saved-nav-button"
          onClick={() => navigateTo('saved')}
        >
          Saved Posts
        </button>
      </div>
      <div className="feed-main-controls">
        <div className="feed-saved-search-sort-row">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="feed-main-search-input"
          />
          <div className="feed-main-sort-container" ref={sortMenuRef}>
            <button 
              className="feed-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
              }}
            >
              Sort: {sortBy} ▼
            </button>
            {showSortMenu && (
              <div className="feed-main-sort-menu">
                {['Latest', 'Oldest', 'Most Liked', 'Most Comments'].map(option => (
                  <div 
                    key={option} 
                    className="feed-main-sort-option"
                    onClick={() => { 
                      setSortBy(option); 
                      setShowSortMenu(false); 
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading your posts...
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', margin: '20px', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="feed-saved-list">
        {!loading && sortedPosts.length === 0 && (
          <div className="feed-saved-empty">
            {searchTerm ? 'No posts found matching your search.' : 'No posts found.'}
          </div>
        )}
        {sortedPosts.map(post => (
          <div key={post.id} className="feed-post-card" style={{ position: 'relative' }}>
            <div className="feed-post-header">
              <img src={post.author.avatar} alt={post.author.name} className="feed-post-avatar" />
              <div className="feed-post-author-info">
                <p className="feed-post-author-name">{post.author.name}</p>
                <p className="feed-post-timestamp">{post.timestamp}</p>
              </div>
              <div ref={openMenuId === post.id ? menuRef : null} style={{ position: 'relative', marginLeft: 'auto' }}>
                <button className="feed-post-menu-button" onClick={() => toggleMenu(post.id)}>
                  ⋮
                </button>
                {openMenuId === post.id && (
                  <div className="feed-post-menu-dropdown" style={{ right: 0, left: 'auto', top: '36px' }}>
                    <button className="feed-post-menu-item" onClick={() => handleEditPost(post)}>✏️ Edit Post</button>
                    <button className="feed-post-menu-item" onClick={() => promptDeletePost(post)}>🗑️ Delete Post</button>
                  </div>
                )}
              </div>
            </div>
            <h3 className="feed-post-title">{post.title}</h3>
            <p className="feed-post-content">{post.content}</p>
            {(post.images && post.images.length > 0) ? (
              <ImageCarousel 
                images={post.images} 
                altText={post.title}
                onImageClick={({ url, alt }) => setExpandedImage({ url, alt })}
              />
            ) : post.image && (
              <img 
                src={post.image} 
                alt={post.title} 
                className="feed-post-image" 
                onClick={() => setExpandedImage({ url: post.image, alt: post.title })}
              />
            )}
            <div className="feed-post-tags">
              {post.category && (
                <span className="feed-post-tag">#{post.category}</span>
              )}
              {typeof post.editCount === 'number' && post.editCount > 0 && (
                <span className="feed-post-tag" style={{ background: '#f3f3f3', color: '#666' }}>Edited {post.editCount} {post.editCount === 1 ? 'time' : 'times'}</span>
              )}
              {/* Resolved/Unresolved tag for relevant categories */}
              {['Marketplace', 'Roommate Request', 'Lost and Found'].includes(post.category) && (
                <span className="feed-post-tag" style={{ background: post.resolved ? '#c6f6d5' : '#fed7d7', color: post.resolved ? '#276749' : '#c53030', marginLeft: '6px' }}>
                  {post.resolved ? 'Resolved' : 'Unresolved'}
                </span>
              )}
            </div>
            <div className="feed-post-actions">
              <button className="feed-post-action-button" onClick={() => navigateTo('comments', post.id, 'myposts')}>💬 {post.commentCount}</button>
              <button className="feed-post-action-button" onClick={() => handleLike(post.id)}>{post.isLikedByUser ? '❤️' : '🤍'} {post.likes}</button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button for Pagination */}
      {nextCursor && !loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            className="feed-main-create-button"
            onClick={handleLoadMore}
          >
            Load More Posts
          </button>
        </div>
      )}

      {loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading more posts...
        </div>
      )}

      {/* Edit Post Modal (rendered once, outside the map loop) */}
      {editingPost && (
        <div className="feed-edit-modal-overlay">
          <div className="feed-edit-modal">
            <h2>Edit Post</h2>
            <form onSubmit={handleEditFormSubmit}>
              <div className="feed-edit-modal-body">
                <div style={{ marginBottom: '18px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#555' }}>
                    Upload Photos (Optional - Max 5)
                  </p>
                  
                  {editForm.images && editForm.images.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      {editForm.images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                          <img 
                            src={img} 
                            alt={`Preview ${idx + 1}`} 
                            style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                          />
                          <button
                            type="button"
                            onClick={() => handleEditRemoveImage(idx)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(220, 38, 38, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!editForm.images || editForm.images.length < 5) && (
                    <label
                      style={{
                        display: 'block',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '14px',
                        backgroundColor: '#fafafa',
                        cursor: 'pointer'
                      }}
                    >
                      📷 Click to upload ({editForm.images?.length || 0}/5)
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleEditImageChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Post Title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditFormChange}
                  required
                  className="event-create-input"
                />
                <textarea
                  placeholder="What's on your mind?"
                  name="content"
                  value={editForm.content}
                  onChange={handleEditFormChange}
                  required
                  className="event-create-textarea"
                />
                <div className="event-create-categories">
                  <p className="event-create-categories-title">Category</p>
                  <div className="event-create-categories-list">
                    {feedCategories.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        className={editCategory === cat ? 'event-create-category-button-active' : 'event-create-category-button'}
                        onClick={() => handleEditCategoryClick(cat)}
                      >
                        #{cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Resolved state selector */}
                <div style={{ margin: '18px 0' }}>
                  <p style={{ fontWeight: 500, marginBottom: '8px' }}>Resolved Status</p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      className={editForm.resolved ? 'event-create-category-button-active' : 'event-create-category-button'}
                      style={{ minWidth: 120 }}
                      onClick={() => setEditForm(form => ({ ...form, resolved: true }))}
                    >
                      Mark as Resolved
                    </button>
                    <button
                      type="button"
                      className={!editForm.resolved ? 'event-create-category-button-active' : 'event-create-category-button'}
                      style={{ minWidth: 120 }}
                      onClick={() => setEditForm(form => ({ ...form, resolved: false }))}
                    >
                      Mark as Unresolved
                    </button>
                  </div>
                </div>
              </div>
              <div className="feed-edit-modal-actions">
                <button type="button" onClick={handleEditModalClose} className="feed-edit-cancel">Cancel</button>
                <button type="submit" disabled={savingEdit} className="feed-edit-save">{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {expandedImage && (
        <ImageModal
          imageUrl={expandedImage.url}
          altText={expandedImage.alt}
          onClose={() => setExpandedImage(null)}
        />
      )}

      {deleteTarget && (
        <div className="confirm-modal-backdrop" onClick={cancelDeletePost}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Delete this post?</h4>
            <p style={{ margin: '8px 0 16px', color: '#4a4a4a' }}>
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn secondary"
                onClick={cancelDeletePost}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn danger"
                onClick={handleDeletePost}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
