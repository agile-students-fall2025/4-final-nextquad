import { useState, useEffect, useRef } from 'react';
import { getPostComments, addComment, updateComment, deleteComment, toggleCommentLike } from '../../services/api';
import './FeedComments.css';

export default function FeedComments({ post, navigateTo, returnToPage = 'main' }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const menuRef = useRef(null);
  const currentUserId = 'user123'; // Mock current user

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
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      setOpenMenuId(null);
      // Update main feed post comment count
      if (window.updateFeedMainPost) {
        const nextCount = Math.max(0, (post.commentCount || 0) - 1);
        window.updateFeedMainPost({ ...post, commentCount: nextCount });
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
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

      {post && (
        <div className="feed-comments-post-preview">
          <div className="feed-comments-post-header">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="feed-comments-post-avatar"
            />
            <div className="feed-comments-post-info">
              <p className="feed-comments-post-author">{post.author.name}</p>
              <p className="feed-comments-post-timestamp">{post.timestamp}</p>
            </div>
          </div>
          <h3 className="feed-comments-post-title">{post.title}</h3>
          <p className="feed-comments-post-content">{post.content}</p>
        </div>
      )}

      <div className="feed-comments-section">
        <h2 className="feed-comments-section-title">Comments ({comments.length})</h2>

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
          {comments.map(comment => (
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
                          <button className="feed-post-menu-item" onClick={() => handleDeleteComment(comment.id)}>🗑️ Delete Comment</button>
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
    </div>
  );
}

