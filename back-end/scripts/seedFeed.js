require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const {
  mockPosts,
  mockComments,
} = require('../data/feed/mockFeedData');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextquad';
  console.log(`[Seed] Connecting to ${uri}`);
  await mongoose.connect(uri);
  console.log('[Seed] Connected. Clearing existing feed collections...');

  await Promise.all([
    Post.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  console.log(`[Seed] Inserting ${mockPosts.length} posts and ${mockComments.length} comments...`);
  await Post.insertMany(mockPosts);
  await Comment.insertMany(mockComments);

  console.log('[Seed] Database seeded ✔');
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});
