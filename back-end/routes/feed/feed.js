const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authenticateToken');

// Import controllers
const {
  getAllPosts,
  searchPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleSavePost,
  getSavedPosts,
  getCategories
} = require('../../controllers/feed/postsController');

const {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} = require('../../controllers/feed/commentsController');

const {
  togglePostLike
} = require('../../controllers/feed/likesController');

// Category routes
router.get('/categories', getCategories);

// Post routes
router.get('/posts/search', authenticateToken, searchPosts); // Must come before /posts/:id
router.get('/posts', authenticateToken, getAllPosts);
router.get('/posts/:id', authenticateToken, getPostById);
router.post('/posts', authenticateToken, createPost);
router.put('/posts/:id', authenticateToken, updatePost);
router.delete('/posts/:id', authenticateToken, deletePost);

// Saved posts routes
router.get('/saved', authenticateToken, getSavedPosts);
router.post('/posts/:id/save', authenticateToken, toggleSavePost);

// Like routes
router.post('/posts/:id/like', authenticateToken, togglePostLike);

// Comment routes
router.get('/posts/:id/comments', authenticateToken, getPostComments);
router.post('/posts/:id/comments', authenticateToken, addComment);
router.put('/comments/:commentId', authenticateToken, updateComment);
router.delete('/comments/:commentId', authenticateToken, deleteComment);
router.post('/comments/:commentId/like', authenticateToken, toggleCommentLike);

module.exports = router;
