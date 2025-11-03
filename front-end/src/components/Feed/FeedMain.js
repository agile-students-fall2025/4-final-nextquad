import { useState, useEffect } from 'react';
import { mockPosts, categories } from '../../data/Feed/mockFeedData';
import './FeedMain.css';

export default function FeedMain({ navigateTo, isAdmin = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

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

  const filteredPosts = mockPosts.filter(post => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(term) ||
      post.content.toLowerCase().includes(term) ||
      post.author.name.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'Latest') return (b.createdAt || 0) - (a.createdAt || 0);
    if (sortBy === 'Oldest') return (a.createdAt || 0) - (b.createdAt || 0);
    if (sortBy === 'Most Liked') return b.likes - a.likes;
    if (sortBy === 'Most Comments') return b.commentCount - a.commentCount;
    return 0;
  });

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
                {categories.map(cat => (
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
        onClick={() => navigateTo('comments', post.id)}
      >
        💬 {post.commentCount}
      </button>
      <button className="feed-post-action-button">
        ❤️ {post.likes}
      </button>
      <button
        className="feed-post-action-button"
        onClick={() => {
          const key = 'savedPostIds';
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          const exists = current.includes(post.id);
          const next = exists ? current.filter(id => id !== post.id) : [...current, post.id];
          localStorage.setItem(key, JSON.stringify(next));
          setSearchTerm(s => s);
        }}
      >
        {JSON.parse(localStorage.getItem('savedPostIds') || '[]').includes(post.id) ? '✓ Saved' : 'Save'}
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
