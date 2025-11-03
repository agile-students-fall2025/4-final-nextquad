import './FeedSavedPosts.css';
import { useState, useMemo } from 'react';
import { mockPosts } from '../../data/Feed/mockFeedData';

export default function FeedSavedPosts({ navigateTo }) {
  const [savedIds, setSavedIds] = useState(() => JSON.parse(localStorage.getItem('savedPostIds') || '[]'));
  const savedPosts = useMemo(() => mockPosts.filter(p => savedIds.includes(p.id)), [savedIds]);

  return (
    <div className="feed-saved-container">
      <div className="feed-saved-header">
        <button type="button" className="feed-saved-back-button" onClick={() => navigateTo('main')}>← Back</button>
        <h1 className="feed-saved-title">Saved Posts</h1>
      </div>

      <div className="feed-saved-list">
        {savedPosts.length === 0 && (
          <div className="feed-saved-empty">No saved posts yet.</div>
        )}
        {savedPosts.map(post => (
          <div key={post.id} className="feed-saved-card">
            <div className="feed-saved-headerline">
              <img src={post.author.avatar} alt={post.author.name} className="feed-saved-avatar" />
              <div>
                <p className="feed-saved-author">{post.author.name}</p>
                <p className="feed-saved-time">{post.timestamp}</p>
              </div>
            </div>
            <h3 className="feed-saved-titleline">{post.title}</h3>
            <p className="feed-saved-content">{post.content}</p>
            {post.image && (
              <img src={post.image} alt={post.title} className="feed-saved-image" />
            )}
            <div className="feed-saved-actions">
              <button className="feed-post-action-button" onClick={() => navigateTo('comments', post.id)}>💬 {post.commentCount}</button>
              <button className="feed-post-action-button">❤️ {post.likes}</button>
              <button className="feed-post-action-button" onClick={() => {
                const key = 'savedPostIds';
                const next = savedIds.filter(id => id !== post.id);
                localStorage.setItem(key, JSON.stringify(next));
                setSavedIds(next);
              }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


