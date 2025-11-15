import './FeedSavedPosts.css'; // Reuse the same styles
import { useState, useEffect, useRef } from 'react';
import { getAllPosts, togglePostLike, deletePost } from '../../services/api';

export default function FeedMyPosts({ navigateTo }) {
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

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
        
        // Remove the post from the local state
        setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        setOpenMenuId(null);
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const toggleMenu = (postId) => {
    setOpenMenuId(openMenuId === postId ? null : postId);
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
          <div key={post.id} className="feed-saved-card" style={{ position: 'relative' }}>
            <div className="feed-saved-headerline">
              <img src={post.author.avatar} alt={post.author.name} className="feed-saved-avatar" />
              <div style={{ flex: 1 }}>
                <p className="feed-saved-author">{post.author.name}</p>
                <p className="feed-saved-time">{post.timestamp}</p>
              </div>
              <div ref={openMenuId === post.id ? menuRef : null}>
                <button 
                  className="feed-post-menu-button"
                  onClick={() => toggleMenu(post.id)}
                >
                  ⋮
                </button>
                {openMenuId === post.id && (
                  <div className="feed-post-menu-dropdown">
                    <button 
                      className="feed-post-menu-item"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      🗑️ Delete Post
                    </button>
                  </div>
                )}
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
