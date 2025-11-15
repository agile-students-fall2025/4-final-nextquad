import './FeedSavedPosts.css'; // Reuse the same styles
import { useState, useEffect, useRef } from 'react';
import { getAllPosts, togglePostLike, deletePost } from '../../services/api';
import { updatePost } from '../../services/api';

export default function FeedMyPosts({ navigateTo }) {
    const [editingPost, setEditingPost] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', image: '', category: '', resolved: false });
    const [savingEdit, setSavingEdit] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const menuRef = useRef(null);
  const feedCategories = ['General','Marketplace','Lost and Found','Roommate Request','Safety Alerts'];
  const [editCategory, setEditCategory] = useState('');

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      try {
        // Fetch all posts and filter by current user (user123)
        const response = await getAllPosts();
        const allPosts = response.data || [];
        
        // Filter posts created by current user (user123)
        const userPosts = allPosts.filter(post => post.author.userId === 'user123');
        setMyPosts(userPosts);
      } catch (err) {
        console.error('Error fetching my posts:', err);
      } finally {
        setLoading(false);
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

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(postId);
        setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setOpenMenuId(null);
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  // Edit handlers (moved to top-level)
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      image: post.image || '',
      category: post.category,
      resolved: !!post.resolved // Always boolean
    });
    setEditCategory(post.category);
    setOpenMenuId(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        image: editForm.image,
        category: editForm.category,
        resolved: editForm.resolved
      };
      const updated = await updatePost(editingPost.id, payload);
      setMyPosts(prevPosts => prevPosts.map(post => post.id === editingPost.id ? updated.data : post));
      // Also update main feed if available
      if (window.updateFeedMainPost) {
        window.updateFeedMainPost(updated.data);
      }
      setEditingPost(null);
    } catch (err) {
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

  // Filter posts by search term
  const filteredPosts = myPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="feed-main-controls" style={{ marginBottom: '0px' }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="feed-main-search-input"
        />
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading your posts...
        </div>
      )}

      <div className="feed-saved-list">
        {!loading && filteredPosts.length === 0 && (
          <div className="feed-saved-empty">No posts found.</div>
        )}
        {filteredPosts.map(post => (
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
                    <button className="feed-post-menu-item" onClick={() => handleDeletePost(post.id)}>🗑️ Delete Post</button>
                  </div>
                )}
              </div>
            </div>
            <h3 className="feed-post-title">{post.title}</h3>
            <p className="feed-post-content">{post.content}</p>
            {post.image && (
              <img src={post.image} alt={post.title} className="feed-post-image" />
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
      {/* Edit Post Modal (rendered once, outside the map loop) */}
      {editingPost && (
        <div className="feed-edit-modal-overlay">
          <div className="feed-edit-modal">
            <h2>Edit Post</h2>
            <form onSubmit={handleEditFormSubmit}>
              <div className="event-create-image-upload" style={{ marginBottom: '18px' }}>
                <span style={{ fontSize: '48px' }}>+</span>
                <p>Upload Photo (Optional)</p>
                {editForm.image && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={editForm.image} alt="Post" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px' }} />
                    <button type="button" className="feed-edit-cancel" style={{ marginTop: '8px' }} onClick={() => setEditForm(f => ({ ...f, image: '' }))}>Remove Image</button>
                  </div>
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
              <div className="feed-edit-modal-actions">
                <button type="button" onClick={handleEditModalClose} className="feed-edit-cancel">Cancel</button>
                <button type="submit" disabled={savingEdit} className="feed-edit-save">{savingEdit ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
