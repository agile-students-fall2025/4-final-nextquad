const { expect } = require('chai');
const { 
  mockPosts, 
  mockComments,
  getNextPostId,
  getNextCommentId 
} = require('../../data/feed/mockFeedData');
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

describe('Feed Posts Controller', () => {
  
  describe('getAllPosts', () => {
    it('should return all posts with success status', () => {
      const req = { query: {} };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllPosts(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      expect(res.data.count).to.be.a('number');
    });

    it('should filter posts by category', () => {
      const req = { query: { category: 'General' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllPosts(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      res.data.data.forEach(post => {
        expect(post.category).to.equal('General');
      });
    });

    it('should filter posts by search term', () => {
      const req = { query: { search: 'test' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllPosts(req, res);

      expect(res.statusCode).to.equal(200);
      // Search results may be empty if no posts match
      expect(res.data.data).to.be.an('array');
    });

    it('should sort posts by latest', () => {
      const req = { query: { sort: 'latest' } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getAllPosts(req, res);

      expect(res.statusCode).to.equal(200);
      const posts = res.data.data;
      if (posts.length > 1) {
        for (let i = 0; i < posts.length - 1; i++) {
          expect(posts[i].createdAt >= posts[i + 1].createdAt).to.be.true;
        }
      }
    });
  });

  describe('getPostById', () => {
    it('should return a post by ID', () => {
      const testPostId = mockPosts[0]?.id || 1;
      const req = { params: { id: testPostId } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getPostById(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data.id).to.equal(testPostId);
    });

    it('should return 404 for non-existent post', () => {
      const req = { params: { id: 99999 } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getPostById(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });

  describe('createPost', () => {
    it('should create a new post with valid data', () => {
      const req = {
        body: {
          title: 'Test Post',
          content: 'This is a test post content',
          category: 'General'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      const initialPostCount = mockPosts.length;
      createPost(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.success).to.be.true;
      expect(res.data.data.title).to.equal('Test Post');
      expect(mockPosts.length).to.equal(initialPostCount + 1);
    });

    it('should create a new post with resolved and editCount initialized', () => {
      const req = {
        body: {
          title: 'Test Post with Resolved',
          content: 'Testing resolved field',
          category: 'Marketplace'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      createPost(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.data.resolved).to.equal(false);
      expect(res.data.data.editCount).to.equal(0);
    });

    it('should return 400 if title is missing', () => {
      const req = {
        body: {
          content: 'This is a test post content',
          category: 'General'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      createPost(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
    });

    it('should return 400 if category is invalid', () => {
      const req = {
        body: {
          title: 'Test Post',
          content: 'Test content',
          category: 'InvalidCategory'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      createPost(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
    });
  });

  describe('updatePost', () => {
    it('should update a post with new title and content', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const req = {
        params: { id: testPostId },
        body: {
          title: 'Updated Title',
          content: 'Updated content'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data.title).to.equal('Updated Title');
      expect(res.data.data.editCount).to.be.at.least(1);
    });

    it('should update post category', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const req = {
        params: { id: testPostId },
        body: {
          category: 'Marketplace'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.data.category).to.equal('Marketplace');
    });

    it('should update post resolved status to true', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const req = {
        params: { id: testPostId },
        body: {
          resolved: true
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data.resolved).to.be.true;
    });

    it('should update post resolved status to false', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const req = {
        params: { id: testPostId },
        body: {
          resolved: false
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.data.resolved).to.be.false;
    });

    it('should increment editCount when post is updated', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const initialEditCount = mockPosts.find(p => p.id === testPostId).editCount || 0;
      
      const req = {
        params: { id: testPostId },
        body: {
          title: 'Another Update'
        }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.data.data.editCount).to.equal(initialEditCount + 1);
    });

    it('should return 404 for non-existent post', () => {
      const req = {
        params: { id: 99999 },
        body: { title: 'Test' }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      updatePost(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });

  describe('deletePost', () => {
    it('should delete a post by ID', () => {
      const testPostId = mockPosts.find(p => p.author.userId === 'user123')?.id || mockPosts[0].id;
      const initialPostCount = mockPosts.length;
      
      const req = { params: { id: testPostId } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      deletePost(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(mockPosts.length).to.equal(initialPostCount - 1);
    });

    it('should return 404 when deleting non-existent post', () => {
      const req = { params: { id: 99999 } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      deletePost(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const req = {};
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getCategories(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
      expect(res.data.data).to.include('All');
    });
  });
});

describe('Feed Comments Controller', () => {
  
  describe('getPostComments', () => {
    it('should return comments for a specific post', () => {
      const testPostId = mockPosts[0]?.id || 1;
      const req = { params: { id: testPostId } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getPostComments(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.be.an('array');
    });

    it('should return 404 for non-existent post', () => {
      const req = { params: { id: 99999 } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      getPostComments(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', () => {
      const testPostId = mockPosts[0]?.id || 1;
      const req = {
        params: { id: testPostId },
        body: { text: 'This is a test comment' }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      const initialCommentCount = mockComments.length;
      addComment(req, res);

      expect(res.statusCode).to.equal(201);
      expect(res.data.success).to.be.true;
      expect(res.data.data.text).to.equal('This is a test comment');
      expect(mockComments.length).to.equal(initialCommentCount + 1);
    });

    it('should return 400 if comment text is empty', () => {
      const testPostId = mockPosts[0]?.id || 1;
      const req = {
        params: { id: testPostId },
        body: { text: '' }
      };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      addComment(req, res);

      expect(res.statusCode).to.equal(400);
      expect(res.data.success).to.be.false;
    });
  });
});

describe('Feed Likes Controller', () => {
  
  describe('togglePostLike', () => {
    it('should like a post', () => {
      const testPostId = mockPosts[0]?.id || 1;
      const req = { params: { id: testPostId } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      togglePostLike(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res.data.success).to.be.true;
      expect(res.data.data).to.have.property('likes');
      expect(res.data.data).to.have.property('isLikedByUser');
    });

    it('should return 404 for non-existent post', () => {
      const req = { params: { id: 99999 } };
      const res = {
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          this.data = data;
        }
      };

      togglePostLike(req, res);

      expect(res.statusCode).to.equal(404);
      expect(res.data.success).to.be.false;
    });
  });
});
