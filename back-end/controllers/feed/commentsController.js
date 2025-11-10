const { 
  mockComments, 
  mockCommentLikes,
  mockPosts,
  getNextCommentId,
  formatRelativeTime
} = require('../../data/feed/mockFeedData');

/**
 * GET /api/feed/posts/:id/comments
 * Get all comments for a specific post
 */
const getPostComments = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    
    // Check if post exists
    const post = mockPosts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Get comments for this post
    let postComments = mockComments.filter(c => c.postId === postId);
    
    // Sort by newest first
    postComments.sort((a, b) => b.createdAt - a.createdAt);

    // Update isLikedByUser status based on mock user
    const currentUserId = 'user123'; // Mock user ID
    postComments = postComments.map(comment => ({
      ...comment,
      isLikedByUser: mockCommentLikes[comment.id]?.includes(currentUserId) || false
    }));

    res.status(200).json({
      success: true,
      count: postComments.length,
      data: postComments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching comments'
    });
  }
};

/**
 * POST /api/feed/posts/:id/comments
 * Add a comment to a post
 */
const addComment = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { text } = req.body;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required'
      });
    }

    // Check if post exists
    const postIndex = mockPosts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Create new comment
    const createdAt = new Date();
    const newComment = {
      id: getNextCommentId(),
      postId,
      text: text.trim(),
      timestamp: formatRelativeTime(createdAt),
      createdAt: createdAt.getTime(),
      likes: 0,
      author: {
        name: 'Current User', // TODO: Get from auth
        avatar: 'https://picsum.photos/seed/currentuser/50/50',
        userId: 'user123' // TODO: Get from auth
      },
      isLikedByUser: false
    };

    mockComments.push(newComment);

    // Update comment count on post
    mockPosts[postIndex].commentCount += 1;

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while adding comment'
    });
  }
};

/**
 * DELETE /api/feed/comments/:commentId
 * Delete a comment
 */
const deleteComment = (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const commentIndex = mockComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const comment = mockComments[commentIndex];

    // Check if user is the author
    const currentUserId = 'user123'; // Mock user ID
    if (comment.author.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this comment'
      });
    }

    // Get the post and update comment count
    const postIndex = mockPosts.findIndex(p => p.id === comment.postId);
    if (postIndex !== -1) {
      mockPosts[postIndex].commentCount = Math.max(0, mockPosts[postIndex].commentCount - 1);
    }

    mockComments.splice(commentIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting comment'
    });
  }
};

/**
 * POST /api/feed/comments/:commentId/like
 * Like/unlike a comment
 */
const toggleCommentLike = (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const commentIndex = mockComments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const currentUserId = 'user123'; // Mock user ID
    
    // Initialize likes array for this comment if it doesn't exist
    if (!mockCommentLikes[commentId]) {
      mockCommentLikes[commentId] = [];
    }

    // Check if user already liked this comment
    const userLikedIndex = mockCommentLikes[commentId].indexOf(currentUserId);
    
    if (userLikedIndex > -1) {
      // Unlike: remove user from likes array
      mockCommentLikes[commentId].splice(userLikedIndex, 1);
      mockComments[commentIndex].likes = Math.max(0, mockComments[commentIndex].likes - 1);
      mockComments[commentIndex].isLikedByUser = false;

      res.status(200).json({
        success: true,
        message: 'Comment unliked successfully',
        data: {
          commentId,
          likes: mockComments[commentIndex].likes,
          isLikedByUser: false
        }
      });
    } else {
      // Like: add user to likes array
      mockCommentLikes[commentId].push(currentUserId);
      mockComments[commentIndex].likes += 1;
      mockComments[commentIndex].isLikedByUser = true;

      res.status(200).json({
        success: true,
        message: 'Comment liked successfully',
        data: {
          commentId,
          likes: mockComments[commentIndex].likes,
          isLikedByUser: true
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while toggling comment like'
    });
  }
};

module.exports = {
  getPostComments,
  addComment,
  deleteComment,
  toggleCommentLike
};
