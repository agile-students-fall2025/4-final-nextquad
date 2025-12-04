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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showResolvedMenu, setShowResolvedMenu] = useState(false);
  const [resolvedFilter, setResolvedFilter] = useState('All'); // All | Resolved | Unresolved
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
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
    
    if (showSortMenu || showCategoryMenu || showResolvedMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSortMenu, showCategoryMenu, showResolvedMenu]);

  const categorySupportsResolved = ['Marketplace', 'Lost and Found', 'Roommate Request'].includes(selectedCategory);

  // Client-side search filter
  const filteredPosts = posts
    .filter(post => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return post.title.toLowerCase().includes(term) ||
        post.content.toLowerCase().includes(term) ||
        post.author.name.toLowerCase().includes(term);
    })
    .filter(post => {
      if (!categorySupportsResolved || resolvedFilter === 'All') return true;
      const isResolved = !!post.resolved;
      return resolvedFilter === 'Resolved' ? isResolved : !isResolved;
    });

  // Sort by comment count (since backend doesn't support this yet)
  const sortedPosts = sortBy === 'Most Comments' 
    ? [...filteredPosts].sort((a, b) => b.commentCount - a.commentCount)
    : filteredPosts;
  
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
 
      <button 
        className="feed-post-action-button"
        onClick={() => navigateTo('comments', post.id, 'main')}
      >
        💬 {post.commentCount}
      </button>
    {!isAdmin && (
      <>
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
