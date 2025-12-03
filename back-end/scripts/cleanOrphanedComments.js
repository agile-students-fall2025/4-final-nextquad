/**
 * Clean up orphaned comments (comments for posts that no longer exist)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const CommentLike = require('../models/CommentLike');

async function cleanOrphanedComments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextquad');
    console.log('✅ Connected to MongoDB\n');

    // Get all post IDs that exist
    const posts = await Post.find({}).select('id').lean();
    const validPostIds = new Set(posts.map(p => p.id));
    console.log(`Found ${validPostIds.size} valid posts\n`);

    // Find orphaned comments
    const allComments = await Comment.find({}).lean();
    const orphanedComments = allComments.filter(c => !validPostIds.has(c.postId));
    
    if (orphanedComments.length === 0) {
      console.log('✅ No orphaned comments found. Database is clean!');
      return;
    }

    console.log(`⚠️  Found ${orphanedComments.length} orphaned comments:\n`);
    orphanedComments.forEach(c => {
      console.log(`   Comment ID: ${c.id} | Missing PostID: ${c.postId} | Author: ${c.author?.name}`);
    });

    // Get orphaned comment IDs
    const orphanedCommentIds = orphanedComments.map(c => c.id);

    console.log(`\n🗑️  Deleting orphaned comments...`);
    
    // Delete orphaned comments
    const deletedComments = await Comment.deleteMany({ 
      id: { $in: orphanedCommentIds } 
    });
    console.log(`✅ Deleted ${deletedComments.deletedCount} orphaned comments`);

    // Delete likes for those orphaned comments
    const deletedLikes = await CommentLike.deleteMany({ 
      commentId: { $in: orphanedCommentIds } 
    });
    console.log(`✅ Deleted ${deletedLikes.deletedCount} comment likes for orphaned comments`);

    console.log('\n✨ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the cleanup
cleanOrphanedComments();
