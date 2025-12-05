import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllPosts, togglePostLike, toggleSavePost, feedCategories, deletePost } from '../../services/api';
import { createReport } from '../../services/api'; 
import ImageModal from './ImageModal';
import ImageCarousel from './ImageCarousel';
import './FeedMain.css';

export default function FeedMain({ navigateTo, isAdmin = false }) {
  const [showReportInput, setShowReportInput] = useState({});
  const [reportReasons, setReportReasons] = useState({}); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showResolvedMenu, setShowResolvedMenu] = useState(false);
  const [resolvedFilter, setResolvedFilter] = useState('All'); // All | Resolved | Unresolved
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [nextCursor, setNextCursor] = useState(null); // Cursor for pagination
  const isFetchingRef = useRef(false);

  // Fetch posts from backend with support for search mode
  // In search mode: queries /search endpoint
  // In normal mode: queries /posts endpoint with filters
  const fetchPosts = useCallback(async (cursor = null) => {
    if (isFetchingRef.current) {
      console.log('⏭️ Skipping fetch - already in progress');
      return;
    }

    try {
      isFetchingRef.current = true;
      if (!cursor) {
        setLoading(true);
        setPosts([]); // Reset posts when fetching from start
        setNextCursor(null);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const params = {
        limit: 10,
        ...(cursor && { before: cursor }) // Add cursor if loading more
      };

      let response;

      // Use getAllPosts for everything (supports search, category, and sort together)
      const sortParam = sortBy === 'Latest' ? 'latest' 
        : sortBy === 'Oldest' ? 'oldest' 
        : sortBy === 'Most Liked' ? 'popular' 
        : sortBy === 'Most Comments' ? 'comments'
        : 'latest';
      
      params.category = selectedCategory !== 'All' ? selectedCategory : undefined;
      params.sort = sortParam;
      
      // Add search if in search mode - use state variable, not parameter
      if (isSearchMode && searchTerm && searchTerm.trim()) {
        params.search = searchTerm;
      }
      
      response = await getAllPosts(params);
      
      if (cursor) {
        // Append to existing posts when loading more
        setPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
      } else {
        // Replace posts when initial load
        setPosts(response.data || []);
      }
      
      // Set next cursor for pagination
      setNextCursor(response.nextCursor || null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [selectedCategory, sortBy, isSearchMode, searchTerm]);

  // Auto-fetch when filters change (normal mode) or when component mounts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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

  // Load more posts with cursor-based pagination
  const handleLoadMore = async () => {
    if (nextCursor) {
      // In search mode, use searchTerm; in normal mode, use null
      const searchQuery = isSearchMode ? searchTerm : null;
      await fetchPosts(nextCursor, searchQuery);
    }
  };

  // Handle search input change - if in search mode and input is cleared, exit search mode
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // If user is in search mode and clears the input, automatically exit search
    if (isSearchMode && !value.trim()) {
      // Set a small timeout to allow state update first
      setTimeout(() => {
        setIsSearchMode(false);
        setPosts([]);
        setNextCursor(null);
        setLoading(true);
        setError(null);
        isFetchingRef.current = true;

        // Fetch normal feed
        const fetchNormalFeed = async () => {
          try {
            const sortParam = sortBy === 'Latest' ? 'latest' 
              : sortBy === 'Oldest' ? 'oldest' 
              : sortBy === 'Most Liked' ? 'popular' 
              : sortBy === 'Most Comments' ? 'comments'
              : 'latest';
            
            const params = {
              category: selectedCategory !== 'All' ? selectedCategory : undefined,
              sort: sortParam,
              limit: 10,
            };
            
            const response = await getAllPosts(params);
            setPosts(response.data || []);
            setNextCursor(response.nextCursor || null);
          } catch (err) {
            console.error('Error fetching posts:', err);
            setError('Failed to load posts. Please try again.');
          } finally {
            setLoading(false);
            isFetchingRef.current = false;
          }
        };
        
        fetchNormalFeed();
      }, 0);
    }
  };

  // Handle search on Enter key press
  const handleSearchKeyPress = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (searchTerm.trim()) {
        // Enter search mode - this will trigger fetchPosts via useEffect
        setIsSearchMode(true);
      }
    }
  };

  // Clear search and return to normal feed
  const handleClearSearch = async () => {
    setSearchTerm('');
    setIsSearchMode(false);
    setPosts([]);
    setNextCursor(null);
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const sortParam = sortBy === 'Latest' ? 'latest' 
        : sortBy === 'Oldest' ? 'oldest' 
        : sortBy === 'Most Liked' ? 'popular' 
        : sortBy === 'Most Comments' ? 'comments'
        : 'latest';
      
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: sortParam,
        limit: 10,
      };
      
      const response = await getAllPosts(params);
      setPosts(response.data || []);
      setNextCursor(response.nextCursor || null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Expose function to update a post from external components (like MyPosts)
  useEffect(() => {
    window.updateFeedMainPost = (updatedPost) => {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        )
      );
    };
    window.updateFeedMainAfterDelete = (deletedPostId) => {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== deletedPostId));
    };
    return () => {
      delete window.updateFeedMainPost;
      delete window.updateFeedMainAfterDelete;
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSortMenu(false);
      setShowCategoryMenu(false);
      setShowResolvedMenu(false);
    };

    const handleScroll = () => {
      setShowSortMenu(false);
      setShowCategoryMenu(false);
      setShowResolvedMenu(false);
    };
    
    if (showSortMenu || showCategoryMenu || showResolvedMenu) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('click', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showSortMenu, showCategoryMenu, showResolvedMenu]);

  const categorySupportsResolved = ['Marketplace', 'Lost and Found', 'Roommate Request'].includes(selectedCategory);

  // Apply resolved filter (backend handles search, category, and sort)
  const filteredPosts = posts
    .filter(post => {
      if (!categorySupportsResolved || resolvedFilter === 'All') return true;
      const isResolved = !!post.resolved;
      return resolvedFilter === 'Resolved' ? isResolved : !isResolved;
    });

  // Posts are already sorted by backend
  const sortedPosts = filteredPosts;
  
  //report a user (admin feature)
const handleReportUser = async (username, postId) => {
  const reason = reportReasons[username];
  
  // if no reason provided, do nothing
  if (!reason || !reason.trim()) {
    return; 
  }

  try {
    const response = await createReport({ username, reason });

    if (response && response.success) {
      // clear input and show success message
      setReportReasons(prev => ({ ...prev, [username]: '' }));
      setShowReportInput(prev => ({
        ...prev,
        [postId]: false,             
        [`${postId}-success`]: true  
      }));

      // hide the success message after 3 seconds
      setTimeout(() => {
        setShowReportInput(prev => ({
          ...prev,
          [`${postId}-success`]: false
        }));
      }, 3000);
    }
  } catch (error) {
    console.error("Error reporting user:", error);
  }
};
  // Delete post (admin feature)
  const handleAdminDelete = async (postId) => {
  if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
    return;
  }

  try {
    await deletePost(postId);

    // Remove the deleted post from the feed
    setPosts(prev => prev.filter(p => p.id !== postId));

    alert("Post deleted successfully.");
  } catch (err) {
    console.error("Admin delete failed:", err);
    alert("Failed to delete post. Please try again.");
  }
};


  return (
    <div className="feed-main-container">
      {/* Quick Navigation Bar (consistent with Events) */}
      <div className="feed-main-header">
        <h2 className="feed-main-header-title">
          Browse Feed
        </h2>
        {!isAdmin && (
          <>
            <button 
              className="feed-main-nav-button"
              onClick={() => navigateTo('saved')}
            >
              Saved Posts
            </button>
            <button 
              className="feed-main-nav-button"
              onClick={() => navigateTo('myposts')}
            >
              My Posts
            </button>
          </>
        )}
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
                setShowResolvedMenu(false);
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
                      setResolvedFilter('All');
                      setShowCategoryMenu(false); 
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Filter Dropdown */}
          {categorySupportsResolved && (
            <div className="feed-main-sort-container">
              <button 
                className="feed-main-sort-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowResolvedMenu(!showResolvedMenu);
                  setShowSortMenu(false);
                  setShowCategoryMenu(false);
                }}
              >
                Status: {resolvedFilter} ▼
              </button>
              {showResolvedMenu && (
                <div className="feed-main-sort-menu">
                  {['All', 'Resolved', 'Unresolved'].map(option => (
                    <div 
                      key={option} 
                      className="feed-main-sort-option"
                      onClick={() => { 
                        setResolvedFilter(option); 
                        setShowResolvedMenu(false); 
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Sort Dropdown */}
          <div className="feed-main-sort-container">
            <button 
              className="feed-main-sort-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortMenu(!showSortMenu);
                setShowCategoryMenu(false);
                setShowResolvedMenu(false);
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

        <div className="feed-main-search-container">
          <input 
            type="text" 
            placeholder="Search posts... (Press Enter to search)" 
            className="feed-main-search-input"
            value={searchTerm} 
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
          />
          {searchTerm && (
            <button 
              className="feed-main-clear-search-button"
              onClick={handleClearSearch}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        
        {!isAdmin && (
          <button 
            className="feed-main-create-button"
            onClick={() => navigateTo('create')}
          >
            + Create New Post
          </button>
        )}
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

      {!loading && !error && sortedPosts.length === 0 && isSearchMode && (
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
            
            {/* Support both new images array and old single image */}
            {(post.images && post.images.length > 0) ? (
              <ImageCarousel 
                images={post.images} 
                altText={post.title}
                onImageClick={({ url, alt }) => setExpandedImage({ url, alt })}
              />
            ) : post.image && (
              <img 
                src={post.image} 
                alt={post.title} 
                className="feed-post-image" 
                onClick={() => setExpandedImage({ url: post.image, alt: post.title })}
              />
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
        onClick={async () => {
          try {
            const response = await toggleSavePost(post.id);
            if (response.success) {
              const isSaved = response.data.isSavedByUser;
              // Update the post's saved status in the UI
              setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, isSavedByUser: isSaved } : p));
            }
          } catch (error) {
            console.error('Failed to toggle save:', error);
          }
        }}
      >
        {post.isSavedByUser ? '✓ Saved' : 'Save'}
      </button>
    </>
  )}

{isAdmin && (
  <>
    {/* Delete Post (Admin Only) */}
    <button 
      className="feed-post-action-button"
      onClick={() => handleAdminDelete(post.id)}
    >
      🗑 Delete
    </button>

    {/* Report User */}
<button 
  className="feed-post-action-button"
  onClick={() => setShowReportInput(prev => ({
    ...prev,
    [post.id]: true
  }))}
>
  ⚠️ Report User
</button>

{showReportInput[post.id] && (
  <div className="feed-post-report-container">
    <input
      type="text"
      placeholder="Reason for report..."
      value={reportReasons[post.author.name] || ''}
      onChange={(e) =>
        setReportReasons(prev => ({ ...prev, [post.author.name]: e.target.value }))
      }
    />
    <button 
      className="feed-post-action-button"
      onClick={() => handleReportUser(post.author.name, post.id)}
    >
      Submit
    </button>
  </div>
)}

{/* Success message */}
{showReportInput[`${post.id}-success`] && (
  <div style={{ marginTop: '8px', color: '#276749'}}>
    User reported successfully 
  </div>
)}

  </>
)}



</div>

          </div>
        ))}
      </div>

      {/* Load More Button for Pagination */}
      {nextCursor && !loadingMore && sortedPosts.length > 0 && (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <button 
            className="feed-main-create-button"
            onClick={handleLoadMore}
          >
            Load More Posts
          </button>
        </div>
      )}

      {loadingMore && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading more posts...
        </div>
      )}
      
      {expandedImage && (
        <ImageModal
          imageUrl={expandedImage.url}
          altText={expandedImage.alt}
          onClose={() => setExpandedImage(null)}
        />
      )}
    </div>
  );
}
