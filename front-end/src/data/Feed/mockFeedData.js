import { faker } from '@faker-js/faker';

// TODO Sprint 2: All mock data should be replaced with backend API calls
// This file uses '@faker-js/faker' package for mock data generation per requirements

// Feed post categories (per UX-DESIGN.md)
export const categories = [
  'All',
  'General',
  'Marketplace',
  'Lost and Found',
  'Roommate Request',
  'Safety Alerts'
];

// Seed faker for consistent results
faker.seed(456);

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
      avatar: `https://picsum.photos/seed/author${id}/50/50`
    }
  };
};

// Generate mock comments
const generateMockComment = (id) => {
  const timestamp = faker.date.recent({ days: 2 });
  return {
    id,
    text: faker.lorem.sentences(faker.number.int({ min: 1, max: 2 })),
    timestamp: formatRelativeTime(timestamp),
    likes: faker.number.int({ min: 0, max: 20 }),
    author: {
      name: faker.person.fullName(),
      avatar: `https://picsum.photos/seed/comment${id}/50/50`
    }
  };
};

// Format timestamp to relative time (e.g., "2 hours ago")
function formatRelativeTime(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

// Generate mock posts (10 posts)
export const mockPosts = Array.from({ length: 10 }, (_, index) => generateMockPost(index + 1));

// Generate mock comments (5 comments per post)
export const mockComments = Array.from({ length: 5 }, (_, index) => generateMockComment(index + 1));

// Helper function to get a post by ID
export const getPostById = (id) => {
  return mockPosts.find(post => post.id === id);
};

// TODO Sprint 2: Replace with backend API calls
// GET /api/feed/posts - Get all posts
// GET /api/feed/posts/:id - Get specific post
// GET /api/feed/posts/:id/comments - Get comments for a post
// POST /api/feed/posts - Create a new post
// POST /api/feed/posts/:id/like - Like a post
// POST /api/feed/comments - Add a comment to a post

