const { faker } = require('@faker-js/faker');

// Feed post categories (per UX-DESIGN.md)
const categories = [
  'All',
  'General',
  'Marketplace',
  'Lost and Found',
  'Roommate Request',
  'Safety Alerts'
];

// Seed faker for consistent results
faker.seed(456);

// Format timestamp to relative time (e.g., "2 hours ago") or absolute date for older posts
function formatRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  // Less than 24 hours: show relative time
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    // More than 24 hours: show formatted date
    const postDate = new Date(date);
    const currentYear = now.getFullYear();
    const postYear = postDate.getFullYear();
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[postDate.getMonth()];
    const day = postDate.getDate();
    
    // Same year: "November 19, at 8:32 AM"
    if (postYear === currentYear) {
      let hours = postDate.getHours();
      const minutes = postDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${month} ${day}, at ${hours}:${minutes} ${ampm}`;
    } else {
      // Different year: "November 7, 2023"
      return `${month} ${day}, ${postYear}`;
    }
  }
}

// Generate a random post using faker
const generateMockPost = (id) => {
  // Pick one random category (single category per post)
  const availableCategories = categories.filter(cat => cat !== 'All');
  const postCategory = faker.helpers.arrayElement(availableCategories);

  // Generate post title and content
  const title = faker.lorem.sentence(faker.number.int({ min: 4, max: 8 }));
  const content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }));

  // Generate timestamp (random time in the past 7 days)
  const createdAt = faker.date.recent({ days: 7 });
  const formattedTimestamp = formatRelativeTime(createdAt);

  // Generate author info
  const authorName = faker.person.fullName();
  
  // Generate post image (only for some posts)
  const hasImage = faker.datatype.boolean({ probability: 0.6 });
  
  // Mock user ID for author (simulate authentication)
  const authorUserId = `user${faker.number.int({ min: 1, max: 100 })}`;
  
  return {
    id,
    title,
    content,
    timestamp: formattedTimestamp,
    createdAt: createdAt.getTime(),
    category: postCategory,
    likes: faker.number.int({ min: 0, max: 150 }),
    commentCount: faker.number.int({ min: 0, max: 50 }),
    image: hasImage ? `https://picsum.photos/seed/post${id}/600/400` : null,
    author: {
      name: authorName,
      avatar: `https://picsum.photos/seed/author${id}/50/50`,
      userId: authorUserId
    },
    isLikedByUser: false, // Track if current user liked this post
    updatedAt: new Date(),
    resolved: false, // New field for resolved status
    editCount: 0 // New field for edit count
  };
};

// Generate mock comment
const generateMockComment = (id, postId) => {
  const timestamp = faker.date.recent({ days: 2 });
  const authorUserId = `user${faker.number.int({ min: 1, max: 100 })}`;
  
  return {
    id,
    postId,
    text: faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })),
    timestamp: formatRelativeTime(timestamp),
    createdAt: timestamp.getTime(),
    likes: faker.number.int({ min: 0, max: 20 }),
    author: {
      name: faker.person.fullName(),
      avatar: `https://picsum.photos/seed/comment${id}/50/50`,
      userId: authorUserId
    },
    isLikedByUser: false,
    editCount: 0
  };
};

// Generate mock posts (10 posts)
let mockPosts = Array.from({ length: 10 }, (_, index) => generateMockPost(index + 1));

// Ensure user123 owns some posts (posts 1, 4, and 7 for testing)
mockPosts[0].author.userId = 'user123';
mockPosts[0].author.name = 'Test User';
mockPosts[3].author.userId = 'user123';
mockPosts[3].author.name = 'Test User';
mockPosts[6].author.userId = 'user123';
mockPosts[6].author.name = 'Test User';

// Generate mock comments (5 comments for each post)
let mockComments = [];
mockPosts.forEach((post, postIndex) => {
  const commentsForPost = Array.from({ length: 5 }, (_, commentIndex) => {
    const commentId = (postIndex * 5) + commentIndex + 1;
    return generateMockComment(commentId, post.id);
  });
  mockComments.push(...commentsForPost);
});

// Ensure user123 owns some comments (comments 1, 6, and 11 for testing)
mockComments[0].author.userId = 'user123';
mockComments[0].author.name = 'Test User';
mockComments[5].author.userId = 'user123';
mockComments[5].author.name = 'Test User';
mockComments[10].author.userId = 'user123';
mockComments[10].author.name = 'Test User';

// Mock likes data (stores which user liked which posts/comments)
// Key: postId or commentId, Value: array of userIds who liked
let mockPostLikes = {
  1: ['user123'], // Mock user liked post 1
  2: ['user123'], // Mock user liked post 2
};

let mockCommentLikes = {
  1: ['user123'], // Mock user liked comment 1
};

// Helper function to get next post ID
const getNextPostId = () => {
  return mockPosts.length > 0 ? Math.max(...mockPosts.map(p => p.id)) + 1 : 1;
};

// Helper function to get next comment ID
const getNextCommentId = () => {
  return mockComments.length > 0 ? Math.max(...mockComments.map(c => c.id)) + 1 : 1;
};

module.exports = {
  categories,
  mockPosts,
  mockComments,
  mockPostLikes,
  mockCommentLikes,
  getNextPostId,
  getNextCommentId,
  generateMockPost,
  generateMockComment,
  formatRelativeTime
};
