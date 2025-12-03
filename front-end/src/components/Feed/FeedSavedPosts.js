import './FeedSavedPosts.css';
import { useState, useEffect, useRef } from 'react';
import { getSavedPosts, togglePostLike } from '../../services/api';

export default function FeedSavedPosts({ navigateTo }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      setLoading(true);
      try {
        // Fetch saved posts from backend (user-specific)
        const response = await getSavedPosts();
        setSavedPosts(response.data || []);
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        setSavedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSortMenu]);

  const handleLike = async (postId) => {
    try {
      const response = await togglePostLike(postId);
      
      // Update the post in the local state
      setSavedPosts(prevPosts => 
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

  // Filter posts by search term
  const filteredPosts = savedPosts.filter(post => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.author.name.toLowerCase().includes(term);
  });

  // Sort posts based on sortBy selection
  const sortedPosts = (() => {
    const posts = [...filteredPosts];
    switch (sortBy) {
      case 'Latest':
        return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      case 'Oldest':
        return posts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      case 'Most Liked':
        return posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'Most Comments':
        return posts.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0));
      default:
        return posts;
    }
  })();

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
          Saved Posts
        </h2>
        <button 
          className="feed-saved-nav-button"
          onClick={() => navigateTo('myposts')}
        >
          My Posts
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
          Loading saved posts...
        </div>
      )}

      <div className="feed-saved-list">
        {!loading && sortedPosts.length === 0 && (
          <div className="feed-saved-empty">
            {searchTerm ? 'No posts found matching your search.' : 'No saved posts yet.'}
          </div>
        )}
        {sortedPosts.map(post => (
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

            <div className="feed-saved-actions">
              <button className="feed-post-action-button" onClick={() => navigateTo('comments', post.id, 'saved')}>💬 {post.commentCount}</button>
              <button 
                className="feed-post-action-button"
                onClick={() => handleLike(post.id)}
              >
                {post.isLikedByUser ? '❤️' : '🤍'} {post.likes}
              </button>
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


