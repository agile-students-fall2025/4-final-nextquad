import { useState } from 'react';
import { mockComments } from '../../data/Feed/mockFeedData';
import './FeedComments.css';

export default function FeedComments({ post, navigateTo }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      // TODO: Send comment to backend
      console.log('Adding comment:', commentText);
      setCommentText('');
    }
  };

  return (
    <div className="feed-comments-container">
      <div className="feed-comments-header">
        <button
          className="feed-comments-back-button"
          onClick={() => navigateTo('main')}
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
        <h2 className="feed-comments-section-title">Comments ({mockComments.length})</h2>

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

        <div className="feed-comments-list">
          {mockComments.map(comment => (
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
                <button className="feed-comment-like-button">
                  ❤️ {comment.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

