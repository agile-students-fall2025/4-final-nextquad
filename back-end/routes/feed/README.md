# Feed Backend API

This directory contains the backend implementation for the Feed feature, following the same architecture pattern as Events.

## Structure

```
back-end/
├── data/feed/
│   └── mockFeedData.js          # Mock data generation using @faker-js/faker
├── controllers/feed/
│   ├── postsController.js       # CRUD operations for posts
│   ├── commentsController.js    # Comment management
│   └── likesController.js       # Like/unlike functionality
├── routes/feed/
│   └── feed.js                  # Route definitions
└── test/feed/
    └── feed.test.js             # Unit tests
```

## API Endpoints

### Posts

- `GET /api/feed/posts` - Get all posts (with optional filters)
  - Query params: `category`, `search`, `sort` (latest/oldest/popular)
- `GET /api/feed/posts/:id` - Get a specific post
- `POST /api/feed/posts` - Create a new post
- `PUT /api/feed/posts/:id` - Update a post
- `DELETE /api/feed/posts/:id` - Delete a post
- `POST /api/feed/posts/:id/like` - Toggle like on a post

### Comments

- `GET /api/feed/posts/:id/comments` - Get all comments for a post
- `POST /api/feed/posts/:id/comments` - Add a comment to a post
- `DELETE /api/feed/comments/:commentId` - Delete a comment
- `POST /api/feed/comments/:commentId/like` - Toggle like on a comment

### Categories

- `GET /api/feed/categories` - Get all available categories

## Categories

- General
- Marketplace
- Lost and Found
- Roommate Request
- Safety Alerts

## Mock Data

The backend uses `@faker-js/faker` to generate realistic mock data:
- 10 posts with varied categories
- 5 comments per post
- Random likes and engagement metrics
- Timestamps showing relative time (e.g., "2h ago")

## Frontend Integration

The frontend now fetches data from the backend API instead of using local mock data:

### Updated Components
- `FeedMain.js` - Fetches posts from `/api/feed/posts`
- `FeedComments.js` - Fetches comments from `/api/feed/posts/:id/comments`
- `FeedSavedPosts.js` - Fetches individual posts by ID
- `FeedCreatePost.js` - Posts new content to `/api/feed/posts`

### API Service (`front-end/src/services/api.js`)

All Feed API calls are centralized in the API service:
```javascript
import { 
  getAllPosts, 
  getPostById, 
  createPost, 
  togglePostLike,
  getPostComments,
  addComment,
  toggleCommentLike
} from '../../services/api';
```

## Running the Backend

1. Install dependencies:
   ```bash
   cd back-end
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3000`

3. Run tests:
   ```bash
   npm test
   ```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "count": 10  // For list endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication

Currently uses a mock user ID (`user123`) for testing. In Sprint 2, this will be replaced with proper authentication using JWT tokens.

## Next Steps (Sprint 2)

1. Implement real database integration (MongoDB/PostgreSQL)
2. Add proper user authentication
3. Implement real image upload functionality
4. Add pagination for posts and comments
5. Add real-time updates using WebSockets
6. Implement search indexing for better search performance
7. Add content moderation features for admin users
