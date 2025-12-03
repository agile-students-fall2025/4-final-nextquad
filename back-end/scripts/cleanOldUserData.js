/**
 * Migration script to clean up old test data with hardcoded 'user123'
 * Run this once after updating the authentication system
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const PostLike = require('../models/PostLike');
const PostSave = require('../models/PostSave');
const CommentLike = require('../models/CommentLike');

async function cleanOldData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextquad');
    console.log('Connected to MongoDB');

    // Find and delete posts with user123
    const postsResult = await Post.deleteMany({ 'author.userId': 'user123' });
    console.log(`✅ Deleted ${postsResult.deletedCount} posts with user123`);

    // Find and delete comments with user123
    const commentsResult = await Comment.deleteMany({ 'author.userId': 'user123' });
    console.log(`✅ Deleted ${commentsResult.deletedCount} comments with user123`);

    // Delete likes from user123
    const postLikesResult = await PostLike.deleteMany({ userId: 'user123' });
    console.log(`✅ Deleted ${postLikesResult.deletedCount} post likes from user123`);

    const commentLikesResult = await CommentLike.deleteMany({ userId: 'user123' });
    console.log(`✅ Deleted ${commentLikesResult.deletedCount} comment likes from user123`);

    // Delete saves from user123
    const savesResult = await PostSave.deleteMany({ userId: 'user123' });
    console.log(`✅ Deleted ${savesResult.deletedCount} saved posts from user123`);

    console.log('\n✨ Migration complete! Old test data has been cleaned up.');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
cleanOldData();
