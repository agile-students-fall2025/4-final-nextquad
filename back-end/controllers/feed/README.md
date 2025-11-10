# Feed Backend Implementation

This directory contains the backend implementation for the Feed feature, following the same architectural pattern as the Events backend.

## Structure

```
back-end/
├── data/feed/
│   └── mockFeedData.js          # Mock data for posts and comments
├── controllers/feed/
│   ├── postsController.js       # Handles post CRUD operations
│   ├── commentsController.js    # Handles comment operations
│   └── likesController.js       # Handles like/unlike operations
├── routes/feed/
│   └── feed.js                  # API route definitions
└── test/feed/
    └── feed.test.js             # Unit tests for feed controllers
```

## API Endpoints

### Posts

- `GET /api/feed/posts` - Get all posts with optional filters
  - Query params: `category`, `search`, `sort` (latest, oldest, popular)
- `GET /api/feed/posts/:id` - Get a single post by ID
- `POST /api/feed/posts` - Create a new post
  - Body: `{ title, content, category, image? }`
- `PUT /api/feed/posts/:id` - Update a post (author only)
- `DELETE /api/feed/posts/:id` - Delete a post (author only)

### Likes

- `POST /api/feed/posts/:id/like` - Toggle like/unlike on a post

### Comments

- `GET /api/feed/posts/:id/comments` - Get all comments for a post
- `POST /api/feed/posts/:id/comments` - Add a comment to a post
  - Body: `{ text }`
- `DELETE /api/feed/comments/:commentId` - Delete a comment (author only)
- `POST /api/feed/comments/:commentId/like` - Toggle like/unlike on a comment

### Categories

- `GET /api/feed/categories` - Get all available feed categories

## Categories

- All (filter only, not assignable)
- General
- Marketplace
- Lost and Found
- Roommate Request
- Safety Alerts

## Mock Data

The mock data is generated using `@faker-js/faker` for consistency with the Events module. Each post includes:

- Unique ID
- Title and content
- Category (one per post)
- Author information (name, avatar, userId)
- Timestamps (relative format like "2h ago")
- Like count and comment count
- Optional image
- User-specific like status

Comments include similar structure with author info, text, likes, and timestamps.

## Frontend Integration

The frontend Feed components have been updated to use the backend API:

- `FeedMain.js` - Fetches posts from `/api/feed/posts`
- `FeedComments.js` - Fetches and submits comments
- `FeedCreatePost.js` - Creates new posts via API
- `FeedSavedPosts.js` - Fetches individual saved posts by ID
- `services/api.js` - Contains all Feed API functions

## Testing

Run tests with:
```bash
cd back-end
npm test
```

Tests cover:
- Post CRUD operations
- Filtering and sorting
- Comment creation and retrieval
- Like/unlike functionality
- Error handling (404, 400, 403)

## Migration from Frontend Mock Data

The mock data has been migrated from `front-end/src/data/Feed/mockFeedData.js` to `back-end/data/feed/mockFeedData.js`. The frontend now fetches all data through API calls instead of using local mock data.

## Next Steps for Sprint 2

1. Add authentication middleware
2. Connect to real database (MongoDB/PostgreSQL)
3. Add image upload functionality
4. Implement admin moderation features
5. Add pagination for posts and comments
6. Add real-time notifications for new comments
