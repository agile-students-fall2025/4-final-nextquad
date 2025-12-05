# Cursor-Based Pagination Implementation

## Summary
Implemented cursor-based pagination for the feed to improve performance. Instead of loading all posts at once, the system now loads 10 posts initially and provides a "Load More" button to fetch additional batches.

## Changes Made

### Backend (`back-end/controllers/feed/postsController.js`)

**Updated `getAllPosts` controller:**
- Added query parameters:
  - `limit`: number of posts per page (default 10, max 50)
  - `before`: cursor timestamp to fetch posts before this timestamp
- Implements cursor-based pagination:
  - Queries for `limit + 1` posts to determine if more posts exist
  - Returns only the requested `limit` posts
  - Sets `nextCursor` to the `createdAt` timestamp of the last post (null if no more)
- Response format:
  ```json
  {
    "success": true,
    "count": 10,
    "data": [...posts],
    "nextCursor": 1733401234567
  }
  ```
- When `nextCursor` is null, user has reached the end of posts

### Frontend (`front-end/src/components/Feed/FeedMain.js`)

**Updated State:**
- Added `nextCursor` state: stores the cursor timestamp for pagination
- Added `loadingMore` state: tracks loading state when fetching additional posts

**Updated `fetchPosts` function:**
- Now accepts optional `cursor` parameter
- When cursor is null: resets posts array and fetches from beginning
- When cursor is provided: appends new posts to existing array
- Properly handles `nextCursor` from response

**Added `handleLoadMore` function:**
- Triggered when user clicks "Load More" button
- Calls `fetchPosts(nextCursor)` to fetch next batch

**Updated JSX:**
- Added "Load More" button that displays when `nextCursor` is not null
- Button is disabled/hidden when loading more posts
- Shows "Loading more posts..." message during load
- Button only appears when there are more posts to fetch

## How It Works

### Initial Page Load
1. User loads feed or changes filters
2. Frontend calls `getAllPosts({ category, sort, limit: 10 })` (no cursor)
3. Backend returns first 10 posts with `nextCursor` set to last post's `createdAt`
4. "Load More" button becomes visible

### Loading More Posts
1. User clicks "Load More" button
2. Frontend calls `getAllPosts({ category, sort, limit: 10, before: nextCursor })`
3. Backend queries for posts where `createdAt < nextCursor`
4. New posts are appended to existing posts array
5. `nextCursor` is updated for next batch
6. When no more posts exist, `nextCursor` is null and button disappears

## Benefits
- **Performance**: Only 10 posts loaded initially instead of potentially hundreds
- **Memory**: Lower memory footprint on both client and server
- **User Experience**: Progressive loading with clear "Load More" action
- **Scalability**: Works efficiently regardless of database size

## Technical Details

**Database Query:**
```javascript
Post.find(query).sort(sortSpec).limit(limitNum + 1).lean()
```
- Sorts by `createdAt` ascending/descending based on sort preference
- Limits to `limit + 1` to detect if more posts exist
- Uses `.lean()` for performance (returns plain JavaScript objects)

**Cursor Format:**
- Uses `createdAt` (Number, epoch milliseconds) as cursor
- MongoDB timestamp stored as milliseconds since epoch
- Allows reliable ordering even with concurrent post creation

## Testing the Implementation

### Initial Load
```bash
# Fetches first 10 posts
GET /api/feed/posts?category=All&sort=latest&limit=10
```

### Load More
```bash
# Fetches 10 posts before timestamp (pagination)
GET /api/feed/posts?category=All&sort=latest&limit=10&before=1733401234567
```

## Edge Cases Handled
1. ✅ No posts available: `nextCursor` is null, button doesn't appear
2. ✅ Fewer posts than limit: `nextCursor` is null after first load
3. ✅ Exact multiple of limit: Button appears/disappears correctly
4. ✅ Multiple categories/sort options: Pagination works with all filters
5. ✅ Concurrent loads: `isFetchingRef` prevents race conditions
