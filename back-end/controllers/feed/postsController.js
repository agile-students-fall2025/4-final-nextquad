const { 
  mockPosts, 
  mockPostLikes, 
  getNextPostId, 
  categories,
  formatRelativeTime
} = require('../../data/feed/mockFeedData');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const PostLike = require('../../models/PostLike');
const PostSave = require('../../models/PostSave');
const CommentLike = require('../../models/CommentLike');

/**
 * GET /api/feed/posts
 * Get all posts with optional filtering and sorting
 */
const getAllPosts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { content: regex }];
    }

    let sortSpec = { createdAt: -1 }; // default latest
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    else if (sort === 'popular') sortSpec = { likes: -1, createdAt: -1 };

    const posts = await Post.find(query).sort(sortSpec).lean();
    const currentUserId = req.user.userId;
    const result = await Promise.all(
      posts.map(async (p) => {
        const count = await Comment.countDocuments({ postId: p.id });
        const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
        const saved = await PostSave.findOne({ postId: p.id, userId: currentUserId }).lean();
        return { ...p, commentCount: count, isLikedByUser: !!liked, isSavedByUser: !!saved, timestamp: formatRelativeTime(new Date(p.createdAt)) };
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error('[getAllPosts] error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching posts',
    });
  }
};

/**
 * GET /api/feed/posts/:id
 * Get a single post by ID
 */
const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ id: postId }).lean();

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const count = await Comment.countDocuments({ postId: post.id });
    const currentUserId = req.user.userId;
    const liked = await PostLike.findOne({ postId: post.id, userId: currentUserId }).lean();
    const saved = await PostSave.findOne({ postId: post.id, userId: currentUserId }).lean();
    const data = { ...post, commentCount: count, isLikedByUser: !!liked, isSavedByUser: !!saved, timestamp: formatRelativeTime(new Date(post.createdAt)) };

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('[getPostById] error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching post' });
  }
};

/**
 * POST /api/feed/posts
 * Create a new post
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, image, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, error: 'Please provide title and content' });
    }
    if (!category) {
      return res.status(400).json({ success: false, error: 'Please select a category' });
    }
    if (!categories.includes(category) || category === 'All') {
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    const currentUser = req.user;
    
    // Check if user has completed profile setup
    if (!currentUser.firstName || !currentUser.lastName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please complete your profile setup before creating posts',
        requiresProfileSetup: true
      });
    }

    const last = await Post.findOne().sort({ id: -1 }).lean();
    const nextId = last ? last.id + 1 : 1;
    
    console.log(`Creating new post. Last post ID: ${last?.id || 'none'}, Next ID: ${nextId}`);

    const createdAtDate = new Date();
    const authorName = `${currentUser.firstName} ${currentUser.lastName}`;
    
    // Handle both single image (backward compatibility) and multiple images
    let postImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      postImages = images;
    } else if (image) {
      postImages = [image];
    }
    
    const doc = await Post.create({
      id: nextId,
      title,
      content,
      createdAt: createdAtDate.getTime(),
      category,
      likes: 0,
      commentCount: 0,
      image: postImages.length > 0 ? postImages[0] : null, // Backward compatibility
      images: postImages,
      author: {
        name: authorName,
        avatar: currentUser.profileImage || `https://picsum.photos/seed/${currentUser.userId}/50/50`,
        userId: currentUser.userId,
      },
      isLikedByUser: false,
      isSavedByUser: false,
      updatedAt: new Date(),
      resolved: false,
      editCount: 0,
    });

    // Add dynamic timestamp for response
    const responseData = doc.toObject();
    responseData.timestamp = formatRelativeTime(new Date(responseData.createdAt));

    res.status(201).json({ success: true, message: 'Post created successfully', data: responseData });
  } catch (error) {
    console.error('[createPost] error:', error);
    res.status(500).json({ success: false, error: 'Server error while creating post' });
  }
};

/**
 * PUT /api/feed/posts/:id
 * Update a post
 */
const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const currentUserId = req.user.userId;
    if (post.author?.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: 'You are not authorized to update this post' });
    }

    const { title, content, category, image, resolved } = req.body;
    let edited = false;
    if (title && title !== post.title) { post.title = title; edited = true; }
    if (content && content !== post.content) { post.content = content; edited = true; }
    if (category && categories.includes(category) && category !== 'All' && category !== post.category) { post.category = category; edited = true; }
    if (image !== undefined && image !== post.image) { post.image = image; edited = true; }
    if (typeof resolved === 'boolean' && resolved !== post.resolved) { post.resolved = resolved; edited = true; }

    if (edited) {
      post.editCount = (post.editCount || 0) + 1;
      post.updatedAt = new Date();
    }

    await post.save();

    res.status(200).json({ success: true, message: 'Post updated successfully', data: post.toObject() });
  } catch (error) {
    console.error('[updatePost] error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating post' });
  }
};

/**
 * DELETE /api/feed/posts/:id
 * Delete a post
 */
const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const currentUserId = req.user.userId;
    const isAdmin = false; // TODO: check if user has admin role
    if (post.author?.userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this post' });
    }

    console.log(`[deletePost] Starting deletion for post ${postId}`);

    // First, get all comment IDs for this post (before deleting them)
    const comments = await Comment.find({ postId: postId }).select('id').lean();
    const commentIds = comments.map(c => c.id);
    
    console.log(`[deletePost] Found ${comments.length} comments for post ${postId}`);
    if (commentIds.length > 0) {
      console.log(`[deletePost] Comment IDs: ${commentIds.join(', ')}`);
    }

    // Delete the post
    const deletedPost = await Post.deleteOne({ id: postId });
    console.log(`[deletePost] Deleted post: ${deletedPost.deletedCount} document(s)`);
    
    // Delete all comments for this post
    const deletedComments = await Comment.deleteMany({ postId: postId });
    console.log(`[deletePost] Deleted ${deletedComments.deletedCount} comments for post ${postId}`);
    
    // Delete all saves for this post
    const deletedSaves = await PostSave.deleteMany({ postId: postId });
    console.log(`[deletePost] Deleted ${deletedSaves.deletedCount} saves`);
    
    // Delete all likes for this post
    const deletedPostLikes = await PostLike.deleteMany({ postId: postId });
    console.log(`[deletePost] Deleted ${deletedPostLikes.deletedCount} post likes`);
    
    // Delete all comment likes for those comments
    if (commentIds.length > 0) {
      const deletedCommentLikes = await CommentLike.deleteMany({ commentId: { $in: commentIds } });
      console.log(`[deletePost] Deleted ${deletedCommentLikes.deletedCount} comment likes`);
    }

    console.log(`✅ [deletePost] Successfully deleted post ${postId} and all associated data`);
    
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('[deletePost] ERROR:', error);
    console.error('[deletePost] Error stack:', error.stack);
    res.status(500).json({ success: false, error: `Server error while deleting post: ${error.message}` });
  }
};

/**
 * POST /api/feed/posts/:id/save
 * Toggle save/unsave for a post
 */
const toggleSavePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const currentUserId = req.user.userId;
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const existing = await PostSave.findOne({ postId, userId: currentUserId });
    if (existing) {
      await PostSave.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, message: 'Post unsaved', data: { postId, isSavedByUser: false } });
    } else {
      await PostSave.create({ postId, userId: currentUserId });
      return res.status(201).json({ success: true, message: 'Post saved', data: { postId, isSavedByUser: true } });
    }
  } catch (error) {
    console.error('[toggleSavePost] error:', error);
    res.status(500).json({ success: false, error: 'Server error while toggling save' });
  }
};

/**
 * GET /api/feed/saved
 * Get all saved posts for current user
 */
const getSavedPosts = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const saves = await PostSave.find({ userId: currentUserId }).lean();
    const postIds = saves.map(s => s.postId);
    if (postIds.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    const posts = await Post.find({ id: { $in: postIds } }).sort({ createdAt: -1 }).lean();
    const result = await Promise.all(posts.map(async (p) => {
      const commentCount = await Comment.countDocuments({ postId: p.id });
      const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
      return { ...p, commentCount, isLikedByUser: !!liked, isSavedByUser: true, timestamp: formatRelativeTime(new Date(p.createdAt)) };
    }));
    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error('[getSavedPosts] error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching saved posts' });
  }
};

/**
 * GET /api/feed/categories
 * Get all available categories
 */
const getCategories = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching categories'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleSavePost,
  getSavedPosts,
  getCategories
};
