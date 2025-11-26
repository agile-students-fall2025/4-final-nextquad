const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllPosts,
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
router.get('/posts', getAllPosts);
router.get('/posts/:id', getPostById);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// Saved posts routes
router.get('/saved', getSavedPosts);
router.post('/posts/:id/save', toggleSavePost);

// Like routes
router.post('/posts/:id/like', togglePostLike);

// Comment routes
router.get('/posts/:id/comments', getPostComments);
router.post('/posts/:id/comments', addComment);
router.put('/comments/:commentId', updateComment);
router.delete('/comments/:commentId', deleteComment);
router.post('/comments/:commentId/like', toggleCommentLike);

module.exports = router;
