import './FeedSavedPosts.css';
import { useState, useEffect } from 'react';
import { getPostById } from '../../services/api';

export default function FeedSavedPosts({ navigateTo }) {
  const [savedIds, setSavedIds] = useState(() => JSON.parse(localStorage.getItem('savedPostIds') || '[]'));
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        // Fetch each saved post from backend
        const posts = await Promise.all(
          savedIds.map(async (id) => {
            try {
              const response = await getPostById(id);
              return response.data;
            } catch (err) {
              console.error(`Error fetching post ${id}:`, err);
              return null;
            }
          })
        );
        // Filter out null values (posts that failed to fetch)
        setSavedPosts(posts.filter(p => p !== null));
      } catch (err) {
        console.error('Error fetching saved posts:', err);
      } finally {
        setLoading(false);
      }
    };

    if (savedIds.length > 0) {
      fetchSavedPosts();
    } else {
      // Clear the list when there are no saved IDs to reflect immediately in UI
      setSavedPosts([]);
      setLoading(false);
    }
  }, [savedIds]);

  return (
    <div className="feed-saved-container">
      <div className="feed-saved-header">
        <button type="button" className="feed-saved-back-button" onClick={() => navigateTo('main')}>← Back</button>
        <h1 className="feed-saved-title">Saved Posts</h1>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading saved posts...
        </div>
      )}

      <div className="feed-saved-list">
        {!loading && savedPosts.length === 0 && (
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
                // Update both the savedIds (source of truth) and the rendered list immediately
                setSavedIds(next);
                setSavedPosts(prev => prev.filter(p => p.id !== post.id));
              }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


