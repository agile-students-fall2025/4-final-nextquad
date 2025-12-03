# Database Migration Scripts

## Clean Old User Data

After updating the authentication system, you need to clean up old test data that was created with the hardcoded `user123` user ID.

### How to Run

1. **Make sure MongoDB is running**
   ```bash
   # Start MongoDB service (Windows)
   net start MongoDB
   
   # Or if using MongoDB Compass, start it there
   ```

2. **Run the cleanup script**
   ```bash
   cd back-end
   node scripts/cleanOldUserData.js
   ```

3. **What it does:**
   - Deletes all posts created by `user123`
   - Deletes all comments created by `user123`
   - Deletes all post likes from `user123`
   - Deletes all comment likes from `user123`
   - Deletes all saved posts from `user123`

### After Running

- All users will start with a clean slate
- New posts/comments will use actual user data from authentication
- Each user will only see their own posts in "My Posts"
- Each user will have their own saved posts
- User names will display as "First Last" instead of email prefix

**Note:** Run this script only once after deploying the authentication updates. Running it again is safe but unnecessary.
