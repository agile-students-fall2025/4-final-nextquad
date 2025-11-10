import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllPosts, togglePostLike, feedCategories } from '../../services/api';
import './FeedMain.css';

export default function FeedMain({ navigateTo, isAdmin = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Track saved post ids locally and persist to localStorage
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedPostIds') || '[]');
    } catch {
      return [];
    }
  });
  const isFetchingRef = useRef(false);

  // Fetch posts from backend - wrapped in useCallback
  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      // Map sortBy to backend parameter
      const sortParam = sortBy === 'Latest' ? 'latest' 
        : sortBy === 'Oldest' ? 'oldest' 
        : sortBy === 'Most Liked' ? 'popular' 
        : 'latest';
      
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: sortParam
      };
      
      const response = await getAllPosts(params);
      setPosts(response.data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Persist savedIds to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('savedPostIds', JSON.stringify(savedIds));
    } catch (e) {
      console.error('Failed to persist saved posts:', e);
    }
  }, [savedIds]);

  const handleLike = async (postId) => {
    try {
      const response = await togglePostLike(postId);
      
      // Update the post in the local state
      setPosts(prevPosts => 
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortMenu(false);
      setShowCategoryMenu(false);
    };
    
    if (showSortMenu || showCategoryMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu, showCategoryMenu]);

  // Client-side search filter
  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.author.name.toLowerCase().includes(term);
  });

  // Sort by comment count (since backend doesn't support this yet)
  const sortedPosts = sortBy === 'Most Comments' 
    ? [...filteredPosts].sort((a, b) => b.commentCount - a.commentCount)
    : filteredPosts;

  return (
    <div className="feed-main-container">
      {/* Quick Navigation Bar (consistent with Events) */}
      <div
        className="feed-main-header"
        style={{
          display: 'flex',
          gap: '12px',
          padding: '20px 24px',
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <h2
          className="feed-main-header-title"
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#333',
            marginRight: 'auto'
          }}
        >
          Browse Feed
        </h2>
      </div>

      <div className="feed-main-controls">
        <div className="feed-main-filter-row">
          {/* Category Dropdown */}
          <div className="feed-main-sort-container">
            <button 
              className="feed-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCategoryMenu(!showCategoryMenu);
                setShowSortMenu(false);
              }}
            >
              Category: {selectedCategory} ▼
            </button>
            {showCategoryMenu && (
              <div className="feed-main-sort-menu">
                {feedCategories.map(cat => (
                  <div 
                    key={cat} 
                    className="feed-main-sort-option"
                    onClick={() => { 
                      setSelectedCategory(cat); 
                      setShowCategoryMenu(false); 
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Sort Dropdown */}
          <div className="feed-main-sort-container">
            <button 
              className="feed-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
                setShowCategoryMenu(false);
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

        <input 
          type="text" 
          placeholder="Search posts..." 
          className="feed-main-search-input"
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button 
          className="feed-main-create-button"
          onClick={() => navigateTo('create')}
        >
          + Create New Post
        </button>
        <div style={{ height: '12px' }} />
        <button 
          className="feed-main-create-button"
          onClick={() => navigateTo('saved')}
          style={{ backgroundColor: 'white', color: '#6B46C1', border: '1px solid #6B46C1' }}
        >
          Saved Posts
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading posts...
        </div>
      )}

      {error && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {!loading && !error && sortedPosts.length === 0 && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No posts found. {searchTerm && 'Try a different search term.'}
        </div>
      )}

      <div className="feed-post-list">
        {sortedPosts.map(post => (
          <div 
            key={post.id} 
            className="feed-post-card"
          >
            <div className="feed-post-header">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="feed-post-avatar"
              />
              <div className="feed-post-author-info">
                <p className="feed-post-author-name">{post.author.name}</p>
                <p className="feed-post-timestamp">{post.timestamp}</p>
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
            </div>

            <div className="feed-post-actions">
  {!isAdmin && (
    <>
      <button 
        className="feed-post-action-button"
        onClick={() => navigateTo('comments', post.id, 'main')}
      >
        💬 {post.commentCount}
      </button>
      <button 
        className="feed-post-action-button"
        onClick={() => handleLike(post.id)}
      >
        {post.isLikedByUser ? '❤️' : '🤍'} {post.likes}
      </button>
      <button
        className="feed-post-action-button"
        onClick={() => {
          setSavedIds(prev => {
            const exists = prev.includes(post.id);
            return exists ? prev.filter(id => id !== post.id) : [...prev, post.id];
          });
          // Also optimistically update the post's saved flag locally (optional)
          setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, isSavedByUser: !savedIds.includes(post.id) } : p));
        }}
      >
        {savedIds.includes(post.id) ? '✓ Saved' : 'Save'}
      </button>
    </>
  )}

  {isAdmin && (
    <>
    {/* sprint 2: add functionality to these buttons */}
      <button 
        className="feed-post-action-button"
        onClick={() => console.log('Delete post', post.id)}
      >
        🗑 Delete
      </button>
      <button 
        className="feed-post-action-button"
        onClick={() => console.log('Report user', post.author.name)}
      >
        ⚠️ Report User
      </button>
    </>
  )}
</div>

          </div>
        ))}
      </div>
    </div>
  );
}
