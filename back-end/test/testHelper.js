// Load environment variables FIRST, before any other requires
// Try to load from back-end/.env (one level up from test/)
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// Set JWT_SECRET if not already set (for tests)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_for_ci_cd_pipeline';
}

const mongoose = require('mongoose');

// Connect to MongoDB before all tests
before(async function() {
  this.timeout(10000); // Increase timeout for database connection
  if (!process.env.MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not set in environment variables');
    console.warn('Tests will be skipped. Please set MONGODB_URI in back-end/.env');
    this.skip(); // Skip all tests if no database connection
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Test database connected');
  } catch (error) {
    console.error('Failed to connect to test database:', error.message);
    console.error('Tests will be skipped. Please check your MONGODB_URI');
    this.skip(); // Skip tests if connection fails
  }
});

// Disconnect from MongoDB after all tests
after(async function() {
  await mongoose.connection.close();
  console.log('Test database disconnected');
});

// Helper function to create a mock response object
const createMockResponse = () => {
  const res = {
    statusCode: null,
    body: null,
    data: null,
    status: function(code) {
      this.statusCode = code;
      return {
        json: (data) => {
          this.body = data;
          this.data = data;
        }
      };
    },
    json: function(data) {
      this.body = data;
      this.data = data;
    }
  };
  return res;
};

// Helper function to create a mock request with user
const createMockRequest = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    user: options.user || null,
    ...options
  };
};

module.exports = {
  createMockResponse,
  createMockRequest
};
