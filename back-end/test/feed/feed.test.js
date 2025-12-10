const { expect } = require('chai');
require('../testHelper'); // Setup database connection
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getCategories
} = require('../../controllers/feed/postsController');
const {
  getPostComments,
  addComment,
  deleteComment,
  toggleCommentLike
} = require('../../controllers/feed/commentsController');
const {
  togglePostLike
} = require('../../controllers/feed/likesController');
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { createMockResponse, createMockRequest } = require('../testHelper');

describe('Feed Posts Controller', () => {
  let testUser;
  let testUserId;

  // Create a test user before tests
  before(async () => {
    const testEmail = 'feedtestuser@example.com';
    testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      testUser = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: 'Feed',
        lastName: 'TestUser',
      });
      await testUser.save();
    }
    testUserId = testUser._id.toString();
  });

  // Clean up test posts after each test
  afterEach(async () => {
    await Post.deleteMany({ title: { $regex: /^Test Post|Updated Title/ } });
    await Comment.deleteMany({ text: { $regex: /^This is a test comment/ } });
  });

  describe('getAllPosts', () => {
    it('should return all posts with success status', (done) => {
      const req = createMockRequest({ query: {} });
      const res = createMockResponse();

      getAllPosts(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array');
        expect(res.body.count).to.be.a('number');
        done();
      }, 100);
    });

    it('should filter posts by category', (done) => {
      const req = createMockRequest({ query: { category: 'General' } });
      const res = createMockResponse();

      getAllPosts(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        if (res.body.data.length > 0) {
          res.body.data.forEach(post => {
            expect(post.category).to.equal('General');
          });
        }
        done();
      }, 100);
    });

    it('should filter posts by search term', (done) => {
      const req = createMockRequest({ query: { search: 'test' } });
      const res = createMockResponse();

      getAllPosts(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.data).to.be.an('array');
        done();
      }, 100);
    });

    it('should sort posts by latest', (done) => {
      const req = createMockRequest({ query: { sort: 'latest' } });
      const res = createMockResponse();

      getAllPosts(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        const posts = res.body.data;
        if (posts.length > 1) {
          for (let i = 0; i < posts.length - 1; i++) {
            const firstDate = new Date(posts[i].createdAt);
            const secondDate = new Date(posts[i + 1].createdAt);
            expect(firstDate >= secondDate).to.be.true;
          }
        }
        done();
      }, 100);
    });
  });

  describe('getPostById', () => {
    it('should return a post by ID', async () => {
      // Get the last post ID and create one with next ID
      const lastPost = await Post.findOne().sort({ id: -1 }).lean();
      const nextId = lastPost ? lastPost.id + 1 : 1;
      
      // Create a test post first
      const testPost = new Post({
        id: nextId,
        title: 'Test Post for Get',
        content: 'Test content',
        category: 'General',
        createdAt: Date.now(),
        author: {
          userId: testUserId,
          name: 'Feed TestUser',
          email: 'feedtestuser@example.com'
        },
      });
      await testPost.save();

      const req = createMockRequest({ params: { id: testPost.id.toString() } });
      const res = createMockResponse();

      await getPostById(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.id).to.equal(testPost.id);

      await Post.findOneAndDelete({ id: testPost.id });
    });

    it('should return 404 for non-existent post', (done) => {
      const fakeId = 99999;
      const req = createMockRequest({ params: { id: fakeId.toString() } });
      const res = createMockResponse();

      getPostById(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });

  describe('createPost', () => {
    it('should create a new post with valid data', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId, email: 'feedtestuser@example.com' },
        body: {
          title: 'Test Post',
          content: 'This is a test post content',
          category: 'General'
        }
      });
      const res = createMockResponse();

      createPost(req, res);

      setTimeout(async () => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.equal('Test Post');
        done();
      }, 100);
    });

    it('should create a new post with resolved and editCount initialized', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId, email: 'feedtestuser@example.com' },
        body: {
          title: 'Test Post with Resolved',
          content: 'Testing resolved field',
          category: 'Marketplace'
        }
      });
      const res = createMockResponse();

      createPost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.data.resolved).to.equal(false);
        expect(res.body.data.editCount).to.equal(0);
        done();
      }, 100);
    });

    it('should return 400 if title is missing', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId, email: 'feedtestuser@example.com' },
        body: {
          content: 'This is a test post content',
          category: 'General'
        }
      });
      const res = createMockResponse();

      createPost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });

    it('should return 400 if category is invalid', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId, email: 'feedtestuser@example.com' },
        body: {
          title: 'Test Post',
          content: 'Test content',
          category: 'InvalidCategory'
        }
      });
      const res = createMockResponse();

      createPost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });

  describe('updatePost', () => {
    let testPostId;

    beforeEach(async () => {
      const lastPost = await Post.findOne().sort({ id: -1 }).lean();
      const nextId = lastPost ? lastPost.id + 1 : 1;
      
      const testPost = new Post({
        id: nextId,
        title: 'Original Title',
        content: 'Original content',
        category: 'General',
        createdAt: Date.now(),
        author: {
          userId: testUserId,
          name: 'Feed TestUser',
          email: 'feedtestuser@example.com'
        },
      });
      await testPost.save();
      testPostId = testPost.id;
    });

    afterEach(async () => {
      if (testPostId) {
        await Post.findOneAndDelete({ id: testPostId });
      }
    });

    it('should update a post with new title and content', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: testPostId },
        body: {
          title: 'Updated Title',
          content: 'Updated content'
        }
      });
      const res = createMockResponse();

      updatePost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data.title).to.equal('Updated Title');
        expect(res.body.data.editCount).to.be.at.least(1);
        done();
      }, 100);
    });

    it('should return 404 for non-existent post', (done) => {
      const fakeId = 99999;
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: fakeId },
        body: { title: 'Test' }
      });
      const res = createMockResponse();

      updatePost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });

  describe('deletePost', () => {
    it('should delete a post by ID', async () => {
      // Get the last post ID and create one with next ID
      const lastPost = await Post.findOne().sort({ id: -1 }).lean();
      const nextId = lastPost ? lastPost.id + 1 : 1;
      
      const testPost = new Post({
        id: nextId,
        title: 'Post to Delete',
        content: 'This will be deleted',
        category: 'General',
        createdAt: Date.now(),
        author: {
          userId: testUserId,
          name: 'Feed TestUser',
          email: 'feedtestuser@example.com'
        },
      });
      await testPost.save();
      const postId = testPost.id;

      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: postId }
      });
      const res = createMockResponse();

      await deletePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.body.success).to.be.true;

      // Verify post is deleted
      const deleted = await Post.findOne({ id: postId });
      expect(deleted).to.be.null;
    });

    it('should return 404 when deleting non-existent post', (done) => {
      const fakeId = 99999;
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: fakeId }
      });
      const res = createMockResponse();

      deletePost(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });

  describe('getCategories', () => {
    it('should return all categories', (done) => {
      const req = createMockRequest({});
      const res = createMockResponse();

      getCategories(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array');
        expect(res.body.data).to.include('All');
        done();
      }, 100);
    });
  });
});

describe('Feed Comments Controller', () => {
  let testUser;
  let testUserId;
  let testPost;

  before(async () => {
    const testEmail = 'commenttestuser@example.com';
    testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      testUser = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: 'Comment',
        lastName: 'TestUser',
      });
      await testUser.save();
    }
    testUserId = testUser._id.toString();

    // Create a test post for comments
    const lastPost = await Post.findOne().sort({ id: -1 }).lean();
    const nextId = lastPost ? lastPost.id + 1 : 1;
    
    testPost = new Post({
      id: nextId,
      title: 'Test Post for Comments',
      content: 'Test content for comments',
      category: 'General',
      createdAt: Date.now(),
      author: {
        userId: testUserId,
        name: 'Comment TestUser',
        email: 'commenttestuser@example.com'
      },
    });
    await testPost.save();
  });

  after(async () => {
    if (testPost) {
      await Post.findOneAndDelete({ id: testPost.id });
    }
    await Comment.deleteMany({ postId: testPost?.id });
  });

  describe('getPostComments', () => {
    it('should return comments for a specific post', (done) => {
      const req = createMockRequest({ params: { id: testPost.id.toString() } });
      const res = createMockResponse();

      getPostComments(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.be.an('array');
        done();
      }, 100);
    });

    it('should return 404 for non-existent post', (done) => {
      const fakeId = 99999;
      const req = createMockRequest({ params: { id: fakeId.toString() } });
      const res = createMockResponse();

      getPostComments(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: testPost.id.toString() },
        body: { text: 'This is a test comment' }
      });
      const res = createMockResponse();

      addComment(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(201);
        expect(res.body.success).to.be.true;
        expect(res.body.data.text).to.equal('This is a test comment');
        done();
      }, 100);
    });

    it('should return 400 if comment text is empty', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: testPost.id.toString() },
        body: { text: '' }
      });
      const res = createMockResponse();

      addComment(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(400);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });
});

describe('Feed Likes Controller', () => {
  let testUser;
  let testUserId;
  let testPost;

  before(async () => {
    const testEmail = 'liketestuser@example.com';
    testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('testpass123', 10);
      testUser = new User({
        email: testEmail,
        password: hashedPassword,
        firstName: 'Like',
        lastName: 'TestUser',
      });
      await testUser.save();
    }
    testUserId = testUser._id.toString();

    const lastPost = await Post.findOne().sort({ id: -1 }).lean();
    const nextId = lastPost ? lastPost.id + 1 : 1;
    
    testPost = new Post({
      id: nextId,
      title: 'Test Post for Likes',
      content: 'Test content for likes',
      category: 'General',
      createdAt: Date.now(),
      author: {
        userId: testUserId,
        name: 'Like TestUser',
        email: 'liketestuser@example.com'
      },
    });
    await testPost.save();
  });

  after(async () => {
    if (testPost) {
      await Post.findOneAndDelete({ id: testPost.id });
    }
  });

  describe('togglePostLike', () => {
    it('should like a post', (done) => {
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: testPost.id.toString() }
      });
      const res = createMockResponse();

      togglePostLike(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(200);
        expect(res.body.success).to.be.true;
        expect(res.body.data).to.have.property('likes');
        expect(res.body.data).to.have.property('isLikedByUser');
        done();
      }, 100);
    });

    it('should return 404 for non-existent post', (done) => {
      const fakeId = 99999;
      const req = createMockRequest({
        user: { userId: testUserId },
        params: { id: fakeId.toString() }
      });
      const res = createMockResponse();

      togglePostLike(req, res);

      setTimeout(() => {
        expect(res.statusCode).to.equal(404);
        expect(res.body.success).to.be.false;
        done();
      }, 100);
    });
  });
});
