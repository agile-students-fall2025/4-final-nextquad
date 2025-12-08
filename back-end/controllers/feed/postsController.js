const { 
  categories
} = require('../../data/feed/mockFeedData');
const User = require('../../models/User');
const { formatRelativeTime } = require('../../utils/timeFormatting');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const PostLike = require('../../models/PostLike');
const PostSave = require('../../models/PostSave');
const CommentLike = require('../../models/CommentLike');
const sendNotification = require('../../utils/sendNotification');

/**
 * Helper: Enrich a single post with current user data and interaction flags
 * @param {Object} post - Post document
 * @param {string} currentUserId - Current user ID for like/save status
 * @param {boolean} skipUserData - If true, don't fetch fresh user data (for backward compatibility)
 */
const enrichPost = async (post, currentUserId, skipUserData = false) => {
  const count = await Comment.countDocuments({ postId: post.id });
  const liked = await PostLike.findOne({ postId: post.id, userId: currentUserId }).lean();
  const saved = await PostSave.findOne({ postId: post.id, userId: currentUserId }).lean();
  
  let enrichedPost = {
    ...post,
    commentCount: count,
    isLikedByUser: !!liked,
    isSavedByUser: !!saved,
    timestamp: formatRelativeTime(new Date(post.createdAt)),
  };
  
  // Fetch fresh user data if author exists and userId is stored
  if (!skipUserData && post.author?.userId) {
    try {
      const userData = await User.findById(post.author.userId).lean();
      if (userData) {
        enrichedPost.author = {
          ...post.author,
          name: `${userData.firstName} ${userData.lastName}`,
          avatar: userData.profileImage || post.author.avatar,
          email: userData.email || post.author.email,
        };
      }
    } catch (err) {
      console.error('Error fetching user data for post enrichment:', err);
      // Keep original author data if fetch fails
    }
  }
  
  return enrichedPost;
};

/**
 * GET /api/feed/posts
 * Get paginated posts with cursor-based pagination
 * Query params:
 *   - category: filter by category
 *   - search: search in title/content
 *   - sort: 'latest' (default), 'oldest', 'popular', 'comments'
 *   - limit: number of posts per page (default 10)
 *   - before: cursor timestamp to load posts before this (for pagination)
 */
const getAllPosts = async (req, res) => {
  try {
    const { category, search, sort, limit = 10, before } = req.query;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // cap at 50

    // Build query
    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { content: regex }];
    }

    // Cursor-based pagination: only fetch posts before the cursor
    if (before) {
      const beforeTimestamp = parseInt(before, 10);
      query.createdAt = { $lt: beforeTimestamp };
    }

    // Determine sort order
    let sortSpec = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    else if (sort === 'popular') sortSpec = { likes: -1, createdAt: -1 };

    let posts;
    
    // Special handling for 'comments' sort - requires aggregation
    if (sort === 'comments') {
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'comments',
            localField: 'id',
            foreignField: 'postId',
            as: 'commentsList'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$commentsList' }
          }
        },
        { $sort: { commentCount: -1, createdAt: -1 } },
        { $limit: limitNum + 1 },
        { $project: { commentsList: 0 } } // Remove the comments array
      ];
      
      posts = await Post.aggregate(pipeline).allowDiskUse(true);
    } else {
      // Fetch limit + 1 posts to detect if there are more posts
      posts = await Post.find(query)
        .sort(sortSpec)
        .limit(limitNum + 1)
        .allowDiskUse(true)
        .lean();
    }

    // Determine if there are more posts and set next cursor
    let hasMore = false;
    let nextCursor = null;
    let postsToReturn = posts;

    if (posts.length > limitNum) {
      hasMore = true;
      postsToReturn = posts.slice(0, limitNum);
      // Next cursor is the createdAt of the last post we're returning
      nextCursor = postsToReturn[postsToReturn.length - 1].createdAt;
    }

    // Enrich posts with additional data (comment count, likes, saves, current user data)
    const currentUserId = req.user.userId;
    const result = await Promise.all(
      postsToReturn.map(async (p) => {
        // For comments sort, commentCount is already included from aggregation
        if (sort === 'comments') {
          const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
          const saved = await PostSave.findOne({ postId: p.id, userId: currentUserId }).lean();
          
          let enrichedPost = { ...p, isLikedByUser: !!liked, isSavedByUser: !!saved, timestamp: formatRelativeTime(new Date(p.createdAt)) };
          
          // Fetch fresh user data
          if (p.author?.userId) {
            try {
              const userData = await User.findById(p.author.userId).lean();
              if (userData) {
                enrichedPost.author = {
                  ...p.author,
                  name: `${userData.firstName} ${userData.lastName}`,
                  avatar: userData.profileImage || p.author.avatar,
                  email: userData.email || p.author.email,
                };
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }
          }
          return enrichedPost;
        } else {
          return enrichPost(p, currentUserId);
        }
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      nextCursor: hasMore ? nextCursor : null, // null means no more posts
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
 * GET /api/feed/posts/search
 * Search posts by title and content with cursor-based pagination
 * Query params:
 *   - query: search term (required, searches title and content)
 *   - limit: number of posts per page (default 10)
 *   - before: cursor timestamp to load posts before this (for pagination)
 */
const searchPosts = async (req, res) => {
  try {
    const { query, limit = 10, before } = req.query;

    // Validate search query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // cap at 50

    // Build search query using regex for title and content
    const searchRegex = new RegExp(query, 'i'); // case-insensitive
    const searchQuery = {
      $or: [
        { title: searchRegex },
        { content: searchRegex },
      ],
    };

    // Cursor-based pagination: only fetch posts before the cursor
    if (before) {
      const beforeTimestamp = parseInt(before, 10);
      searchQuery.createdAt = { $lt: beforeTimestamp };
    }

    // Fetch limit + 1 posts to detect if there are more
    const posts = await Post.find(searchQuery)
      .sort({ createdAt: -1 }) // newest first
      .limit(limitNum + 1)
      .lean();

    // Determine if there are more posts and set next cursor
    let hasMore = false;
    let nextCursor = null;
    let postsToReturn = posts;

    if (posts.length > limitNum) {
      hasMore = true;
      postsToReturn = posts.slice(0, limitNum);
      // Next cursor is the createdAt of the last post we're returning
      nextCursor = postsToReturn[postsToReturn.length - 1].createdAt;
    }

    // Enrich posts with additional data (comment count, likes, saves, current user data)
    const currentUserId = req.user.userId;
    const result = await Promise.all(
      postsToReturn.map((p) => enrichPost(p, currentUserId))
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      nextCursor: hasMore ? nextCursor : null, // null means no more posts
    });
  } catch (error) {
    console.error('[searchPosts] error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while searching posts',
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

    const currentUserId = req.user.userId;
    const data = await enrichPost(post, currentUserId);

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
    
    // Fetch freshest user profile to get current name and profileImage
    const userDoc = await User.findById(currentUser.userId).lean();
    const profileImage = userDoc?.profileImage || null;
    
    // Check if user has completed profile setup
    if (!userDoc?.firstName || !userDoc?.lastName) {
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
    const authorName = `${userDoc.firstName} ${userDoc.lastName}`;
    
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
        avatar: profileImage || `https://picsum.photos/seed/${currentUser.userId}/50/50`,
        userId: currentUser.userId,
        email: currentUser.email || currentUser.nyuEmail || '',
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

    const { title, content, category, image, images, resolved } = req.body;
    let edited = false;
    if (title && title !== post.title) { post.title = title; edited = true; }
    if (content && content !== post.content) { post.content = content; edited = true; }
    if (category && categories.includes(category) && category !== 'All' && category !== post.category) { post.category = category; edited = true; }
    
    // Handle images array (new multi-image support)
    if (images !== undefined) {
      const newImages = Array.isArray(images) ? images : [];
      const currentImages = post.images || [];
      if (JSON.stringify(newImages) !== JSON.stringify(currentImages)) {
        post.images = newImages;
        // Also set first image to legacy 'image' field for backward compatibility
        post.image = newImages.length > 0 ? newImages[0] : null;
        edited = true;
      }
    } else if (image !== undefined && image !== post.image) {
      // Fallback for single image (legacy support)
      post.image = image;
      edited = true;
    }
    
    // Notification trigger for resolved status
    // Check if resolved is a boolean and if the status has changed
    if (typeof resolved === 'boolean' && resolved !== post.resolved) {

      // update resolved status
      post.resolved = resolved;
      edited = true;

      // Find all users who saved this post
      const savers = await PostSave.find({ postId: post.id });

      // send notification to each saver
      for (const s of savers) {
        await sendNotification({
          recipientId: s.userId,
          senderId: req.user.userId,
          postId: post.id,
          type: "post_resolved_status",
          message: `A post you saved has been marked as ${resolved ? "resolved" : "unresolved"}: ${post.title}`
        });
      }
    }

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
    const isAdmin = req.user.role === 'admin';
    if (post.author?.userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this post'});
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
    const posts = await Post.find({ id: { $in: postIds } }).sort({ createdAt: -1 }).allowDiskUse(true).lean();
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
 * GET /api/feed/posts/mine
 * Get paginated posts created by current user with optional search and sort
 * Query params:
 *   - limit: number of posts per page (default 10)
 *   - before: cursor timestamp to load posts before this
 *   - search: optional search term to filter title and content
 *   - sort: 'latest' (default), 'oldest', 'popular' (most liked), 'comments'
 */
const getMyPostsPaginated = async (req, res) => {
  try {
    const { limit = 10, before, search, sort } = req.query;
    const currentUserId = req.user.userId;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // cap at 50

    // Build query - always filter by author using dot notation
    const query = { 'author.userId': currentUserId };

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    // Cursor-based pagination: only fetch posts before the cursor
    if (before) {
      const beforeTimestamp = parseInt(before, 10);
      query.createdAt = { $lt: beforeTimestamp };
    }

    // Determine sort order
    let sortSpec = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    else if (sort === 'popular') sortSpec = { likes: -1, createdAt: -1 };

    let posts;
    
    // Special handling for 'comments' sort - requires aggregation
    if (sort === 'comments') {
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'comments',
            localField: 'id',
            foreignField: 'postId',
            as: 'commentsList'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$commentsList' }
          }
        },
        { $sort: { commentCount: -1, createdAt: -1 } },
        { $limit: limitNum + 1 },
        { $project: { commentsList: 0 } }
      ];
      
      posts = await Post.aggregate(pipeline).allowDiskUse(true);
    } else {
      // Fetch limit + 1 posts to detect if there are more
      posts = await Post.find(query)
        .sort(sortSpec)
        .limit(limitNum + 1)
        .allowDiskUse(true)
        .lean();
    }

    // Determine if there are more posts and set next cursor
    let hasMore = false;
    let nextCursor = null;
    let postsToReturn = posts;

    if (posts.length > limitNum) {
      hasMore = true;
      postsToReturn = posts.slice(0, limitNum);
      nextCursor = postsToReturn[postsToReturn.length - 1].createdAt;
    }

    // Enrich posts with additional data and current user info
    const result = await Promise.all(
      postsToReturn.map(async (p) => {
        if (sort === 'comments') {
          const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
          const saved = await PostSave.findOne({ postId: p.id, userId: currentUserId }).lean();
          
          let enrichedPost = { ...p, isLikedByUser: !!liked, isSavedByUser: !!saved, timestamp: formatRelativeTime(new Date(p.createdAt)) };
          
          // Fetch fresh user data
          if (p.author?.userId) {
            try {
              const userData = await User.findById(p.author.userId).lean();
              if (userData) {
                enrichedPost.author = {
                  ...p.author,
                  name: `${userData.firstName} ${userData.lastName}`,
                  avatar: userData.profileImage || p.author.avatar,
                  email: userData.email || p.author.email,
                };
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }
          }
          return enrichedPost;
        } else {
          return enrichPost(p, currentUserId);
        }
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      nextCursor: hasMore ? nextCursor : null,
    });
  } catch (error) {
    console.error('[getMyPostsPaginated] error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching your posts',
    });
  }
};

/**
 * GET /api/feed/saved (paginated)
 * Get paginated saved posts for current user with optional search and sort
 * Query params:
 *   - limit: number of posts per page (default 10)
 *   - before: cursor timestamp to load posts before this
 *   - search: optional search term to filter title and content
 *   - sort: 'latest' (default), 'oldest', 'popular' (most liked), 'comments'
 */
const getSavedPostsPaginated = async (req, res) => {
  try {
    const { limit = 10, before, search, sort } = req.query;
    const currentUserId = req.user.userId;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50); // cap at 50

    // Get all saved post IDs for this user
    const saves = await PostSave.find({ userId: currentUserId }).lean();
    const savedPostIds = saves.map(s => s.postId);

    if (savedPostIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        nextCursor: null,
      });
    }

    // Build query - filter by saved post IDs
    const query = { id: { $in: savedPostIds } };

    // Add search filter if provided
    if (search && search.trim()) {
      const searchRegex = new RegExp(search, 'i'); // case-insensitive
      query.$or = [
        { title: searchRegex },
        { content: searchRegex },
      ];
    }

    // Cursor-based pagination: only fetch posts before the cursor
    if (before) {
      const beforeTimestamp = parseInt(before, 10);
      query.createdAt = { $lt: beforeTimestamp };
    }

    // Determine sort order
    let sortSpec = { createdAt: -1 }; // default: newest first
    if (sort === 'oldest') sortSpec = { createdAt: 1 };
    else if (sort === 'popular') sortSpec = { likes: -1, createdAt: -1 };

    let posts;
    
    // Special handling for 'comments' sort - requires aggregation
    if (sort === 'comments') {
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'comments',
            localField: 'id',
            foreignField: 'postId',
            as: 'commentsList'
          }
        },
        {
          $addFields: {
            commentCount: { $size: '$commentsList' }
          }
        },
        { $sort: { commentCount: -1, createdAt: -1 } },
        { $limit: limitNum + 1 },
        { $project: { commentsList: 0 } }
      ];
      
      posts = await Post.aggregate(pipeline).allowDiskUse(true);
    } else {
      posts = await Post.find(query)
        .sort(sortSpec)
        .limit(limitNum + 1)
        .allowDiskUse(true)
        .lean();
    }

    // Determine if there are more posts and set next cursor
    let hasMore = false;
    let nextCursor = null;
    let postsToReturn = posts;

    if (posts.length > limitNum) {
      hasMore = true;
      postsToReturn = posts.slice(0, limitNum);
      nextCursor = postsToReturn[postsToReturn.length - 1].createdAt;
    }

    // Enrich posts with additional data and current user info
    const result = await Promise.all(
      postsToReturn.map(async (p) => {
        if (sort === 'comments') {
          const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
          
          let enrichedPost = { ...p, isLikedByUser: !!liked, isSavedByUser: true, timestamp: formatRelativeTime(new Date(p.createdAt)) };
          
          // Fetch fresh user data
          if (p.author?.userId) {
            try {
              const userData = await User.findById(p.author.userId).lean();
              if (userData) {
                enrichedPost.author = {
                  ...p.author,
                  name: `${userData.firstName} ${userData.lastName}`,
                  avatar: userData.profileImage || p.author.avatar,
                  email: userData.email || p.author.email,
                };
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }
          }
          return enrichedPost;
        } else {
          const count = await Comment.countDocuments({ postId: p.id });
          const liked = await PostLike.findOne({ postId: p.id, userId: currentUserId }).lean();
          
          let enrichedPost = {
            ...p,
            commentCount: count,
            isLikedByUser: !!liked,
            isSavedByUser: true,
            timestamp: formatRelativeTime(new Date(p.createdAt)),
          };
          
          // Fetch fresh user data
          if (p.author?.userId) {
            try {
              const userData = await User.findById(p.author.userId).lean();
              if (userData) {
                enrichedPost.author = {
                  ...p.author,
                  name: `${userData.firstName} ${userData.lastName}`,
                  avatar: userData.profileImage || p.author.avatar,
                  email: userData.email || p.author.email,
                };
              }
            } catch (err) {
              console.error('Error fetching user data:', err);
            }
          }
          return enrichedPost;
        }
      })
    );

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      nextCursor: hasMore ? nextCursor : null,
    });
  } catch (error) {
    console.error('[getSavedPostsPaginated] error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching saved posts',
    });
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
  searchPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPostsPaginated,
  toggleSavePost,
  getSavedPosts,
  getSavedPostsPaginated,
  getCategories
};
