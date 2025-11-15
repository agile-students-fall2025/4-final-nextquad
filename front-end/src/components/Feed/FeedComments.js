import { useState, useEffect } from 'react';
import { getPostComments, addComment, toggleCommentLike } from '../../services/api';
import './FeedComments.css';

export default function FeedComments({ post, navigateTo, returnToPage = 'main' }) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      try {
        const response = await addComment(post.id, commentText.trim());
        // Add new comment to the list
        setComments(prev => [response.data, ...prev]);
        setCommentText('');
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
            <div key={comment.id} className="feed-comment-item">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="feed-comment-avatar"
              />
              <div className="feed-comment-content">
                <div className="feed-comment-header">
                  <p className="feed-comment-author">{comment.author.name}</p>
                  <p className="feed-comment-timestamp">{comment.timestamp}</p>
                </div>
                <p className="feed-comment-text">{comment.text}</p>
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
    </div>
  );
}

