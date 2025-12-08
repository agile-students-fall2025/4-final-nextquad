const Post = require('../../models/Post');
const PostLike = require('../../models/PostLike');
const sendNotification = require('../../utils/sendNotification');

/**
 * POST /api/feed/posts/:id/like
 * Like/unlike a post
 */
const togglePostLike = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const currentUser = req.user;
    const currentUserId = currentUser.userId;

    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const existing = await PostLike.findOne({ postId, userId: currentUserId });

    if (existing) {
      // Unlike
      await PostLike.deleteOne({ _id: existing._id });
      post.likes = Math.max(0, (post.likes || 0) - 1);
      await post.save();
      return res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: { postId, likes: post.likes, isLikedByUser: false }
      });
    } else {
      // Like
      await PostLike.create({ postId, userId: currentUserId });
      post.likes = (post.likes || 0) + 1;
      await post.save();

      // post_like notification
      if (post.author?.userId) {
        await sendNotification({
          type: 'post_like',
          recipientId: post.author.userId,
          senderId: currentUserId,
          postId: post.id,
          message: `${currentUser.firstName} ${currentUser.lastName} liked your post: ${post.title}`
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        data: { postId, likes: post.likes, isLikedByUser: true }
      });
    }
  } catch (error) {
    console.error('[togglePostLike] error:', error);
    res.status(500).json({ success: false, error: 'Server error while toggling post like' });
  }
};

module.exports = {
  togglePostLike
};