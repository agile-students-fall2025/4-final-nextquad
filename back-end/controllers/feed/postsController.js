const { 
  mockPosts, 
  mockPostLikes, 
  getNextPostId, 
  categories,
  formatRelativeTime
} = require('../../data/feed/mockFeedData');

/**
 * GET /api/feed/posts
 * Get all posts with optional filtering and sorting
 */
const getAllPosts = (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    let filteredPosts = [...mockPosts];

    // Filter by category
    if (category && category !== 'All') {
      filteredPosts = filteredPosts.filter(post => 
        post.category === category
      );
    }

    // Filter by search term (searches in title and content)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort posts
    if (sort === 'latest') {
      filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sort === 'oldest') {
      filteredPosts.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sort === 'popular') {
      filteredPosts.sort((a, b) => b.likes - a.likes);
    } else {
      // Default: sort by latest (newest first)
      filteredPosts.sort((a, b) => b.createdAt - a.createdAt);
    }

    // Update isLikedByUser status based on mock user
    const currentUserId = 'user123'; // Mock user ID
    filteredPosts = filteredPosts.map(post => ({
      ...post,
      isLikedByUser: mockPostLikes[post.id]?.includes(currentUserId) || false
    }));

    res.status(200).json({
      success: true,
      count: filteredPosts.length,
      data: filteredPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching posts'
    });
  }
};

/**
 * GET /api/feed/posts/:id
 * Get a single post by ID
 */
const getPostById = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = mockPosts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update isLikedByUser status
    const currentUserId = 'user123'; // Mock user ID
    const postWithLikeStatus = {
      ...post,
      isLikedByUser: mockPostLikes[post.id]?.includes(currentUserId) || false
    };

    res.status(200).json({
      success: true,
      data: postWithLikeStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching post'
    });
  }
};

/**
 * POST /api/feed/posts
 * Create a new post
 */
const createPost = (req, res) => {
  try {
    const { title, content, category, image } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and content'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Please select a category'
      });
    }

    // Validate category
    if (!categories.includes(category) || category === 'All') {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }

    // Create new post
    const createdAt = new Date();
    const newPost = {
      id: getNextPostId(),
      title,
      content,
      timestamp: formatRelativeTime(createdAt),
      createdAt: createdAt.getTime(),
      category,
      likes: 0,
      commentCount: 0,
      image: image || null,
      author: {
        name: 'Current User', // TODO: Get from auth
        avatar: 'https://picsum.photos/seed/currentuser/50/50',
        userId: 'user123' // TODO: Get from auth
      },
      isLikedByUser: false,
      updatedAt: new Date()
    };

    mockPosts.push(newPost);

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while creating post'
    });
  }
};

/**
 * PUT /api/feed/posts/:id
 * Update a post
 */
const updatePost = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postIndex = mockPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const post = mockPosts[postIndex];

    // Check if user is the author (simple auth check)
    const currentUserId = 'user123'; // Mock user ID
    if (post.author.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this post'
      });
    }

    // Update fields
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

    mockPosts[postIndex] = post;

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating post'
    });
  }
};

/**
 * DELETE /api/feed/posts/:id
 * Delete a post
 */
const deletePost = (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const postIndex = mockPosts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const post = mockPosts[postIndex];

    // Check if user is the author
    const currentUserId = 'user123'; // Mock user ID
    if (post.author.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this post'
      });
    }

    mockPosts.splice(postIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting post'
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
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getCategories
};
