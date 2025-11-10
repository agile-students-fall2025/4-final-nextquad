const { 
  mockPosts,
  mockPostLikes
} = require('../../data/feed/mockFeedData');

/**
 * POST /api/feed/posts/:id/like
 * Like/unlike a post
 */
const togglePostLike = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postIndex = mockPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const currentUserId = 'user123'; // Mock user ID
    
    // Initialize likes array for this post if it doesn't exist
    if (!mockPostLikes[postId]) {
      mockPostLikes[postId] = [];
    }

    // Check if user already liked this post
    const userLikedIndex = mockPostLikes[postId].indexOf(currentUserId);
    
    if (userLikedIndex > -1) {
      // Unlike: remove user from likes array
      mockPostLikes[postId].splice(userLikedIndex, 1);
      mockPosts[postIndex].likes = Math.max(0, mockPosts[postIndex].likes - 1);
      mockPosts[postIndex].isLikedByUser = false;

      res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: {
          postId,
          likes: mockPosts[postIndex].likes,
          isLikedByUser: false
        }
      });
    } else {
      // Like: add user to likes array
      mockPostLikes[postId].push(currentUserId);
      mockPosts[postIndex].likes += 1;
      mockPosts[postIndex].isLikedByUser = true;

      res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        data: {
          postId,
          likes: mockPosts[postIndex].likes,
          isLikedByUser: true
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while toggling post like'
    });
  }
};

module.exports = {
  togglePostLike
};
