import './FeedSavedPosts.css';
import { useState, useEffect, useRef } from 'react';
import { getSavedPostsPaginated, togglePostLike, toggleSavePost } from '../../services/api';
import ImageCarousel from './ImageCarousel';
import ImageModal from './ImageModal';

export default function FeedSavedPosts({ navigateTo }) {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [sortBy, setSortBy] = useState('Latest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const sortMenuRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    const fetchSavedPosts = async (cursor = null, searchQuery = null) => {
      if (isFetchingRef.current) return;

      try {
        isFetchingRef.current = true;
        if (!cursor) {
          setLoading(true);
          setSavedPosts([]);
          setNextCursor(null);
          setError(null);
        } else {
          setLoadingMore(true);
        }

        const sortParam = sortBy === 'Latest' ? 'latest' : sortBy === 'Oldest' ? 'oldest' : sortBy === 'Most Liked' ? 'popular' : sortBy === 'Most Comments' ? 'comments' : 'latest';
        const params = {
          limit: 10,
          ...(cursor && { before: cursor }),
          ...(searchQuery && { search: searchQuery }),
          sort: sortParam,
        };

        const response = await getSavedPostsPaginated(params);

        if (cursor) {
          setSavedPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
        } else {
          setSavedPosts(response.data || []);
        }

        setNextCursor(response.nextCursor || null);
      } catch (err) {
        console.error('Error fetching saved posts:', err);
        setSavedPosts([]);
        setError('Failed to load saved posts. Please try again.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    };

    fetchSavedPosts();
  }, [sortBy]);

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

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim()) {
        setIsSearchMode(true);
        isFetchingRef.current = true;
        setLoading(true);
        setSavedPosts([]);
        setNextCursor(null);
        setError(null);

        try {
          const sortParam = sortBy === 'Latest' ? 'latest' : sortBy === 'Oldest' ? 'oldest' : sortBy === 'Most Liked' ? 'popular' : sortBy === 'Most Comments' ? 'comments' : 'latest';
          const response = await getSavedPostsPaginated({
            search: searchTerm,
            sort: sortParam,
            limit: 10,
          });

          setSavedPosts(response.data || []);
          setNextCursor(response.nextCursor || null);
        } catch (err) {
          console.error('Error searching saved posts:', err);
          setError('Failed to search posts. Please try again.');
        } finally {
          setLoading(false);
          isFetchingRef.current = false;
        }
      } else {
        if (isSearchMode) {
          setIsSearchMode(false);
          isFetchingRef.current = true;
          setLoading(true);
          setSavedPosts([]);
          setNextCursor(null);
          setError(null);

          try {
            const sortParam = sortBy === 'Latest' ? 'latest' : sortBy === 'Oldest' ? 'oldest' : sortBy === 'Most Liked' ? 'popular' : sortBy === 'Most Comments' ? 'comments' : 'latest';
            const response = await getSavedPostsPaginated({ limit: 10, sort: sortParam });
            setSavedPosts(response.data || []);
            setNextCursor(response.nextCursor || null);
          } catch (err) {
            console.error('Error fetching saved posts:', err);
            setError('Failed to load posts. Please try again.');
          } finally {
            setLoading(false);
            isFetchingRef.current = false;
          }
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, isSearchMode, sortBy]);

  // Load more posts
  const handleLoadMore = async () => {
    if (nextCursor) {
      const searchQuery = isSearchMode ? searchTerm : null;
      isFetchingRef.current = true;
      setLoadingMore(true);

      try {
        const sortParam = sortBy === 'Latest' ? 'latest' : sortBy === 'Oldest' ? 'oldest' : sortBy === 'Most Liked' ? 'popular' : sortBy === 'Most Comments' ? 'comments' : 'latest';
        const params = {
          limit: 10,
          before: nextCursor,
          ...(searchQuery && { search: searchQuery }),
          sort: sortParam,
        };

        const response = await getSavedPostsPaginated(params);
        setSavedPosts(prevPosts => [...prevPosts, ...(response.data || [])]);
        setNextCursor(response.nextCursor || null);
      } catch (err) {
        console.error('Error loading more posts:', err);
      } finally {
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    }
  };

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

  // Posts are already sorted by backend
  const sortedPosts = savedPosts;

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

      {error && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#dc2626', backgroundColor: '#fee2e2', margin: '20px', borderRadius: '8px' }}>
          {error}
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
                className="feed-saved-image" 
                onClick={() => setExpandedImage({ url: post.image, alt: post.title })}
                style={{ cursor: 'pointer' }}
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

            <div className="feed-saved-actions">
              <button className="feed-post-action-button" onClick={() => navigateTo('comments', post.id, 'saved')}>💬 {post.commentCount}</button>
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
                    await toggleSavePost(post.id);
                    // Remove from local state after successful unsave
                    setSavedPosts(prev => prev.filter(p => p.id !== post.id));
                  } catch (err) {
                    console.error('Error removing saved post:', err);
                    alert('Failed to remove saved post');
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button for Pagination */}
      {nextCursor && !loadingMore && (
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


