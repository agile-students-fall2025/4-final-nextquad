/**
 * Diagnostic script to check the current state of posts and comments
 * Helps identify orphaned comments or ID conflicts
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const PostLike = require('../models/PostLike');
const PostSave = require('../models/PostSave');
const CommentLike = require('../models/CommentLike');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nextquad');
    console.log('✅ Connected to MongoDB\n');

    // Get all posts
    const posts = await Post.find({}).sort({ id: 1 }).lean();
    console.log(`📝 Total Posts: ${posts.length}`);
    posts.forEach(p => {
      console.log(`   Post ID: ${p.id} | Title: "${p.title}" | Author: ${p.author?.name} (${p.author?.userId})`);
    });
    console.log('');

    // Get all comments
    const comments = await Comment.find({}).sort({ id: 1 }).lean();
    console.log(`💬 Total Comments: ${comments.length}`);
    comments.forEach(c => {
      console.log(`   Comment ID: ${c.id} | PostID: ${c.postId} | Author: ${c.author?.name} (${c.author?.userId}) | Text: "${c.text.substring(0, 50)}..."`);
    });
    console.log('');

    // Check for orphaned comments (comments whose post doesn't exist)
    const postIds = new Set(posts.map(p => p.id));
    const orphanedComments = comments.filter(c => !postIds.has(c.postId));
    
    if (orphanedComments.length > 0) {
      console.log(`⚠️  Found ${orphanedComments.length} ORPHANED COMMENTS (post was deleted but comment remains):`);
      orphanedComments.forEach(c => {
        console.log(`   Comment ID: ${c.id} | PostID: ${c.postId} (MISSING) | Author: ${c.author?.name}`);
      });
      console.log('');
    } else {
      console.log(`✅ No orphaned comments found\n`);
    }

    // Get all likes
    const postLikes = await PostLike.find({}).lean();
    const commentLikes = await CommentLike.find({}).lean();
    console.log(`❤️  Post Likes: ${postLikes.length} | Comment Likes: ${commentLikes.length}`);
    
    // Get all saves
    const saves = await PostSave.find({}).lean();
    console.log(`🔖 Saved Posts: ${saves.length}`);
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Comments: ${comments.length}`);
    console.log(`   - Orphaned Comments: ${orphanedComments.length}`);
    console.log(`   - Post Likes: ${postLikes.length}`);
    console.log(`   - Comment Likes: ${commentLikes.length}`);
    console.log(`   - Saved Posts: ${saves.length}`);
    
    if (orphanedComments.length > 0) {
      console.log('\n🔧 To fix orphaned comments, run:');
      console.log('   node scripts/cleanOrphanedComments.js');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the check
checkDatabase();
