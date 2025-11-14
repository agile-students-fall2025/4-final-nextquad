import './FeedSavedPosts.css'; // Reuse the same styles
import { useState, useEffect } from 'react';
import { getAllPosts, togglePostLike } from '../../services/api';

export default function FeedMyPosts({ navigateTo }) {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="feed-saved-container">
      <div className="feed-saved-header">
        <button
          className="feed-saved-back-button"
          onClick={() => navigateTo('main')}
        >
          ← Back
        </button>
        <h1 className="feed-saved-title">My Posts</h1>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading your posts...
        </div>
      )}

      <div className="feed-saved-list">
        {!loading && myPosts.length === 0 && (
          <div className="feed-saved-empty">You haven't created any posts yet.</div>
        )}
        {myPosts.map(post => (
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
              <button className="feed-post-action-button" onClick={() => navigateTo('comments', post.id, 'myposts')}>💬 {post.commentCount}</button>
              <button 
                className="feed-post-action-button"
                onClick={() => handleLike(post.id)}
              >
                {post.isLikedByUser ? '❤️' : '🤍'} {post.likes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
