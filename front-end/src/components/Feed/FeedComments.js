import { useState, useEffect, useRef } from 'react';
import { getPostComments, addComment, updateComment, deleteComment, toggleCommentLike, togglePostLike, toggleSavePost } from '../../services/api';
import ImageModal from './ImageModal';
import ImageCarousel from './ImageCarousel';
import './FeedComments.css';

export default function FeedComments({ post, navigateTo, returnToPage = 'main' }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [postState, setPostState] = useState(post);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedPostIds') || '[]');
    } catch {
      return [];
    }
  });
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [sortBy, setSortBy] = useState('Newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);
  const sortMenuRef = useRef(null);
  
  // Get current user ID from localStorage
  const userData = localStorage.getItem('user');
  const currentUserId = userData ? JSON.parse(userData).id : null;

  // Update local post state when prop changes
  useEffect(() => {
    setPostState(post);
  }, [post]);

  // Prevent background scroll when delete modal is open
  useEffect(() => {
    if (deleteTarget) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [deleteTarget]);

  // Fetch comments when component mounts or post changes
  useEffect(() => {
    const fetchComments = async () => {
      if (!post?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await getPostComments(post.id);
        setComments(response.data || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [post?.id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      try {
        const response = await addComment(post.id, commentText.trim());
        // Add new comment to the list
        setComments(prev => [response.data, ...prev]);
        setCommentText('');
        // Optimistically update main feed/post lists comment count
        if (window.updateFeedMainPost) {
          const nextCount = (post.commentCount || 0) + 1;
          window.updateFeedMainPost({ ...post, commentCount: nextCount });
        }
      } catch (err) {
        console.error('Error adding comment:', err);
        alert('Failed to add comment. Please try again.');
      }
    }
  };

  const handleLikePost = async () => {
    try {
      const response = await togglePostLike(postState.id);
      setPostState(prev => ({
        ...prev,
        likes: response.data.likes,
        isLikedByUser: response.data.isLikedByUser
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleSavePost = async () => {
    try {
      const response = await toggleSavePost(postState.id);
      if (response.success) {
        const isSaved = response.data.isSavedByUser;
        setPostState(prev => ({
          ...prev,
          isSavedByUser: isSaved
        }));
      }
    } catch (err) {
      console.error('Error saving post:', err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await toggleCommentLike(commentId);
      
      // Update the comment in the local state
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: response.data.likes, isLikedByUser: response.data.isLikedByUser }
            : comment
        )
      );
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
    setOpenMenuId(null);
  };

  const handleUpdateComment = async (e) => {
    e.preventDefault();
    if (!editText.trim() || !editingComment) return;

    setSavingEdit(true);
    try {
      const response = await updateComment(editingComment.id, editText.trim());
      // Update comment in list, preserving isLikedByUser from current state
      setComments(prevComments =>
        prevComments.map(c =>
          c.id === editingComment.id 
            ? { ...response.data, isLikedByUser: c.isLikedByUser } 
            : c
        )
      );
      setEditingComment(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    } finally {
      setSavingEdit(false);
    }
  };

  const promptDeleteComment = (comment) => {
    setDeleteTarget(comment);
    setOpenMenuId(null);
  };

  const cancelDeleteComment = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const commentId = deleteTarget.id;

    try {
      await deleteComment(commentId);
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      setOpenMenuId(null);
      setDeleteTarget(null);
      // Update main feed post comment count
      if (window.updateFeedMainPost) {
        const nextCount = Math.max(0, (post.commentCount || 0) - 1);
        window.updateFeedMainPost({ ...post, commentCount: nextCount });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Get sorted comments based on selected sort option
  const getSortedComments = () => {
    const sorted = [...comments];
    
    if (sortBy === 'Most Liked') {
      // Sort by likes descending, then by newest
      sorted.sort((a, b) => {
        if (b.likes !== a.likes) {
          return b.likes - a.likes;
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else if (sortBy === 'Oldest') {
      // Sort by oldest first
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: Newest first
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    return sorted;
  };

  return (
    <div className="feed-comments-container">
      <div className="feed-comments-nav-bar">
        <button
          className="feed-comments-back-button"
          onClick={() => navigateTo(returnToPage)}
        >
          ← Back
        </button>
        <h1 className="feed-comments-title">Comments</h1>
      </div>

      {postState && (
        <div className="feed-comments-post-preview">
          <div className="feed-comments-post-header">
            <img
              src={postState.author.avatar}
              alt={postState.author.name}
              className="feed-comments-post-avatar"
            />
            <div className="feed-comments-post-info">
              <p className="feed-comments-post-author">{postState.author.name}</p>
              <p className="feed-comments-post-timestamp">{postState.timestamp}</p>
            </div>
          </div>
          <h3 className="feed-comments-post-title">{postState.title}</h3>
          <p className="feed-comments-post-content">{postState.content}</p>
          {(postState.images && postState.images.length > 0) ? (
            <ImageCarousel 
              images={postState.images} 
              altText={postState.title}
              onImageClick={({ url, alt }) => setExpandedImage({ url, alt })}
            />
          ) : postState.image && (
            <img 
              src={postState.image} 
              alt={postState.title} 
              className="feed-post-image" 
              onClick={() => setExpandedImage({ url: postState.image, alt: postState.title })}
            />
          )}

          <div className="feed-post-tags">
            {postState.category && (
              <span className="feed-post-tag">#{postState.category}</span>
            )}
            {typeof postState.editCount === 'number' && postState.editCount > 0 && (
              <span className="feed-post-tag" style={{ background: '#f3f3f3', color: '#666' }}>Edited {postState.editCount} {postState.editCount === 1 ? 'time' : 'times'}</span>
            )}
            {/* Resolved/Unresolved tag for relevant categories */}
            {['Marketplace', 'Roommate Request', 'Lost and Found'].includes(postState.category) && (
              <span className="feed-post-tag" style={{ background: postState.resolved ? '#c6f6d5' : '#fed7d7', color: postState.resolved ? '#276749' : '#c53030', marginLeft: '6px' }}>
                {postState.resolved ? 'Resolved' : 'Unresolved'}
              </span>
            )}
          </div>

          <div className="feed-post-actions">
            <button 
              className="feed-post-action-button"
              onClick={handleLikePost}
            >
              {postState.isLikedByUser ? '❤️' : '🤍'} {postState.likes}
            </button>
            <button
              className="feed-post-action-button"
              onClick={handleSavePost}
            >
              {postState.isSavedByUser ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <div className="feed-comments-section">
        <div className="feed-comments-header-row">
          <h2 className="feed-comments-section-title" style={{ margin: 0 }}>Comments ({comments.length})</h2>
          
          {/* Sort Dropdown */}
          <div className="feed-comments-sort-container" ref={sortMenuRef}>
            <button 
              className="feed-comments-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
              }}
              type="button"
            >
              Sort: {sortBy} <span>▼</span>
            </button>
            {showSortMenu && (
              <div className="feed-comments-sort-menu">
                {['Most Liked', 'Newest', 'Oldest'].map(option => (
                  <div 
                    key={option} 
                    className="feed-comments-sort-option"
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

        <form className="feed-comments-form" onSubmit={handleSubmit}>
          <textarea
            placeholder="Add a comment..."
            className="feed-comments-input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="feed-comments-submit-button">
            Post Comment
          </button>
        </form>

        {loading && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading comments...
          </div>
        )}

        {error && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div className="feed-comments-list">
          {getSortedComments().map(comment => (
            <div key={comment.id} className="feed-comment-item" style={{ position: 'relative' }}>
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="feed-comment-avatar"
              />
              <div className="feed-comment-content">
                <div className="feed-comment-header">
                  <p className="feed-comment-author">{comment.author.name}</p>
                  <p className="feed-comment-timestamp">{comment.timestamp}</p>
                  {comment.author.userId === currentUserId && (
                    <div ref={openMenuId === comment.id ? menuRef : null}>
                      <button
                        className="feed-post-menu-button"
                        onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                      >
                        ⋮
                      </button>
                      {openMenuId === comment.id && (
                        <div className="feed-post-menu-dropdown" style={{ right: 0, left: 'auto', top: '36px' }}>
                          <button className="feed-post-menu-item" onClick={() => handleEditComment(comment)}>✏️ Edit Comment</button>
                          <button className="feed-post-menu-item" onClick={() => promptDeleteComment(comment)}>🗑️ Delete Comment</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="feed-comment-text">{comment.text}</p>
                {typeof comment.editCount === 'number' && comment.editCount > 0 && (
                  <span className="feed-comment-edit-tag">Edited {comment.editCount} {comment.editCount === 1 ? 'time' : 'times'}</span>
                )}
                <button 
                  className="feed-comment-like-button"
                  onClick={() => handleLikeComment(comment.id)}
                >
                  {comment.isLikedByUser ? '❤️' : '🤍'} {comment.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Comment Modal */}
      {editingComment && (
        <div className="feed-edit-modal-overlay">
          <div className="feed-edit-modal">
            <h2>Edit Comment</h2>
            <form onSubmit={handleUpdateComment}>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                required
                className="feed-edit-textarea"
                placeholder="Edit your comment..."
              />
              <div className="feed-edit-modal-actions">
                <button
                  type="button"
                  className="feed-edit-cancel"
                  onClick={() => {
                    setEditingComment(null);
                    setEditText('');
                  }}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="feed-edit-save"
                  disabled={!editText.trim() || savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
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
        <div className="confirm-modal-backdrop" onClick={cancelDeleteComment}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Delete this comment?</h4>
            <p style={{ margin: '8px 0 16px', color: '#4a4a4a' }}>
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="confirm-modal-actions">
              <button
                className="confirm-modal-btn secondary"
                onClick={cancelDeleteComment}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="confirm-modal-btn danger"
                onClick={handleDeleteComment}
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

