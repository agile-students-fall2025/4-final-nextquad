const { formatRelativeTime } = require('../../utils/timeFormatting');
const sendNotification = require('../../utils/sendNotification');
const Comment = require('../../models/Comment');
const Post = require('../../models/Post');
const CommentLike = require('../../models/CommentLike');

/**
 * GET /api/feed/posts/:id/comments
 * Get all comments for a specific post
 */
const getPostComments = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const post = await Post.findOne({ id: postId }).lean();
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();

    const currentUserId = req.user.userId;
    const withLikeFlag = await Promise.all(
      comments.map(async c => {
        const liked = await CommentLike.findOne({ commentId: c.id, userId: currentUserId }).lean();
        return { ...c, isLikedByUser: !!liked, timestamp: formatRelativeTime(new Date(c.createdAt)) };
      })
    );
    res.status(200).json({ success: true, count: withLikeFlag.length, data: withLikeFlag });
  } catch (error) {
    console.error('[getPostComments] error:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching comments' });
  }
};

/**
 * POST /api/feed/posts/:id/comments
 * Add a comment to a post
 */
const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }
    const post = await Post.findOne({ id: postId });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    const currentUser = req.user;
    if (!currentUser.firstName || !currentUser.lastName) {
      return res.status(400).json({
        success: false,
        error: 'Please complete your profile setup before commenting',
        requiresProfileSetup: true
      });
    }

    const last = await Comment.findOne().sort({ id: -1 }).lean();
    const nextId = last ? last.id + 1 : 1;
    const createdAtDate = new Date();
    const authorName = `${currentUser.firstName} ${currentUser.lastName}`;

    const doc = await Comment.create({
      id: nextId,
      postId,
      text: text.trim(),
      createdAt: createdAtDate.getTime(),
      likes: 0,
      author: {
        name: authorName,
        avatar: currentUser.profileImage || `https://picsum.photos/seed/${currentUser.userId}/50/50`,
        userId: currentUser.userId
      },
      isLikedByUser: false,
      editCount: 0,
    });

    // send notifications
    const postAuthorId = post.author?.userId;  // Safe access

    // post_comment notification
    if (postAuthorId && postAuthorId !== currentUser.userId) {
      await sendNotification({
        type: 'post_comment',
        recipientId: postAuthorId,
        senderId: currentUser.userId,
        postId: post.id,
        commentId: nextId,
        message: `${authorName} commented on your post: ${post.title}`
      });
    }

    // thread_reply notification
    const pastCommenters = await Comment.find({ postId }).lean();
    const uniqueOtherCommenters = [...new Set(
      pastCommenters
        .map(c => c.author.userId)
        .filter(uid => uid !== currentUser.userId && uid !== postAuthorId)
    )];
    for (const recipientId of uniqueOtherCommenters) {
      await sendNotification({
        type: 'thread_reply',
        recipientId,
        senderId: currentUser.userId,
        postId: post.id,
        commentId: nextId,
        message: `${authorName} also commented on a post you’re following: ${post.title}`
      });
    }

    const responseData = doc.toObject();
    responseData.timestamp = formatRelativeTime(new Date(responseData.createdAt));

    res.status(201).json({ success: true, message: 'Comment added successfully', data: responseData });
  } catch (error) {
    console.error('[addComment] error:', error);
    res.status(500).json({ success: false, error: 'Server error while adding comment' });
  }
};

/**
 * PUT /api/feed/comments/:commentId
 * Update a comment
 */
const updateComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    const comment = await Comment.findOne({ id: commentId });
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    const currentUserId = req.user.userId;
    if (comment.author?.userId !== currentUserId) {
      return res.status(403).json({ success: false, error: 'You are not authorized to update this comment' });
    }
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment text is required' });
    }
    if (text.trim() !== comment.text) {
      comment.text = text.trim();
      comment.editCount = (comment.editCount || 0) + 1;
      comment.updatedAt = new Date();
    }
    await comment.save();
    res.status(200).json({ success: true, message: 'Comment updated successfully', data: comment.toObject() });
  } catch (error) {
    console.error('[updateComment] error:', error);
    res.status(500).json({ success: false, error: 'Server error while updating comment' });
  }
};

/**
 * DELETE /api/feed/comments/:commentId
 * Delete a comment
 */
const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    const comment = await Comment.findOne({ id: commentId });
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }
    const currentUserId = req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (comment.author.userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ success: false, error: 'You are not authorized to delete this comment' });
    }
    await Comment.deleteOne({ id: commentId });
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('[deleteComment] error:', error);
    res.status(500).json({ success: false, error: 'Server error while deleting comment' });
  }
};

/**
 * POST /api/feed/comments/:commentId/like
 * Like/unlike a comment
 */
const toggleCommentLike = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    const currentUser = req.user;

    const comment = await Comment.findOne({ id: commentId });
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found' });
    }

    const post = await Post.findOne({ id: comment.postId });

    const existing = await CommentLike.findOne({ commentId, userId: currentUser.userId });

    if (existing) {
      // Unlike
      await CommentLike.deleteOne({ _id: existing._id });
      comment.likes = Math.max(0, (comment.likes || 0) - 1);
      await comment.save();

      return res.status(200).json({
        success: true,
        message: 'Comment unliked successfully',
        data: { commentId, likes: comment.likes, isLikedByUser: false }
      });
    } else {
      // Like
      await CommentLike.create({ commentId, userId: currentUser.userId });
      comment.likes = (comment.likes || 0) + 1;
      await comment.save();

      // comment_like notification
      await sendNotification({
        type: 'comment_like',
        recipientId: comment.author.userId, 
        senderId: currentUser.userId,
        postId: comment.postId,
        commentId: comment.id,
        message: `${currentUser.firstName} ${currentUser.lastName} liked your comment on: ${post ? post.title : 'a post'}`
      });

      return res.status(200).json({
        success: true,
        message: 'Comment liked successfully',
        data: { commentId, likes: comment.likes, isLikedByUser: true }
      });
    }
  } catch (error) {
    console.error('[toggleCommentLike] error:', error);
    res.status(500).json({ success: false, error: 'Server error while toggling comment like' });
  }
};

module.exports = {
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike
};