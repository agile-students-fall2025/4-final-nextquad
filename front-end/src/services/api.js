// API Service for Events
// This file centralizes all backend API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// Events APIs
// ============================================

/**
 * Get all events with optional filters
 * @param {Object} params - Query parameters (category, search, sort, showPast)
 */
export const getAllEvents = async (params = {}) => {
  // Filter out undefined values to avoid sending "undefined" as string
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const queryString = new URLSearchParams(cleanParams).toString();
  const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
  return fetchAPI(endpoint);
};

/**
 * Get a single event by ID
 * @param {number} eventId - Event ID
 */
export const getEventById = async (eventId) => {
  return fetchAPI(`/events/${eventId}`);
};

/**
 * Create a new event
 * @param {Object} eventData - Event data (title, date, time, location, description, category)
 */
export const createEvent = async (eventData) => {
  return fetchAPI('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
};

/**
 * Update an event
 * @param {number} eventId - Event ID
 * @param {Object} eventData - Updated event data
 */
export const updateEvent = async (eventId, eventData) => {
  return fetchAPI(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
};

/**
 * Delete an event
 * @param {number} eventId - Event ID
 */
export const deleteEvent = async (eventId) => {
  return fetchAPI(`/events/${eventId}`, {
    method: 'DELETE',
  });
};

// ============================================
// User Events APIs
// ============================================

/**
 * Get events user has RSVP'd to (attending)
 */
export const getUserRSVPedEvents = async () => {
  return fetchAPI('/events/user/rsvps');
};

/**
 * Get events user is hosting
 */
export const getUserHostedEvents = async () => {
  return fetchAPI('/events/user/hosting');
};

/**
 * Get events needing user attention (check-in or survey)
 */
export const getEventsNeedingAttention = async () => {
  return fetchAPI('/events/user/needs-attention');
};

/**
 * Get user's past events
 */
export const getUserPastEvents = async () => {
  return fetchAPI('/events/user/past');
};

// ============================================
// RSVP APIs
// ============================================

/**
 * RSVP to an event
 * @param {number} eventId - Event ID
 */
export const rsvpToEvent = async (eventId) => {
  return fetchAPI(`/events/${eventId}/rsvp`, {
    method: 'POST',
  });
};

/**
 * Cancel RSVP to an event
 * @param {number} eventId - Event ID
 */
export const cancelRSVP = async (eventId) => {
  return fetchAPI(`/events/${eventId}/rsvp`, {
    method: 'DELETE',
  });
};

/**
 * Get all RSVPs for an event (host only)
 * @param {number} eventId - Event ID
 */
export const getEventRSVPs = async (eventId) => {
  return fetchAPI(`/events/${eventId}/rsvps`);
};

/**
 * Check RSVP status for an event
 * @param {number} eventId - Event ID
 */
export const checkRSVPStatus = async (eventId) => {
  return fetchAPI(`/events/${eventId}/rsvp-status`);
};

// ============================================
// Survey APIs
// ============================================

/**
 * Submit survey feedback for an event
 * @param {number} eventId - Event ID
 * @param {Object} surveyData - Survey data (rating, enjoyedAspects, feedback)
 */
export const submitSurvey = async (eventId, surveyData) => {
  return fetchAPI(`/events/${eventId}/survey`, {
    method: 'POST',
    body: JSON.stringify(surveyData),
  });
};

/**
 * Get all survey responses for an event (host only)
 * @param {number} eventId - Event ID
 */
export const getEventSurveys = async (eventId) => {
  return fetchAPI(`/events/${eventId}/surveys`);
};

/**
 * Check if user has submitted survey for an event
 * @param {number} eventId - Event ID
 */
export const checkSurveyStatus = async (eventId) => {
  return fetchAPI(`/events/${eventId}/survey-status`);
};

// ============================================
// Analytics APIs
// ============================================

/**
 * Get analytics data for an event (host only)
 * @param {number} eventId - Event ID
 */
export const getEventAnalytics = async (eventId) => {
  return fetchAPI(`/events/${eventId}/analytics`);
};

/**
 * Check in to an event
 * @param {number} eventId - Event ID
 */
export const checkInToEvent = async (eventId) => {
  return fetchAPI(`/events/${eventId}/checkin`, {
    method: 'POST',
  });
};

// Export categories (could be fetched from backend in the future)
export const categories = ['All', 'Music', 'Social', 'Study', 'Career', 'Wellness', 'Tech', 'Party'];

// ============================================
// Feed APIs
// ============================================

/**
 * Get all feed posts with optional filters
 * @param {Object} params - Query parameters (category, search, sort)
 */
export const getAllPosts = async (params = {}) => {
  // Filter out undefined values to avoid sending "undefined" as string
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const queryString = new URLSearchParams(cleanParams).toString();
  const endpoint = `/feed/posts${queryString ? `?${queryString}` : ''}`;
  return fetchAPI(endpoint);
};

/**
 * Get a single post by ID
 * @param {number} postId - Post ID
 */
export const getPostById = async (postId) => {
  return fetchAPI(`/feed/posts/${postId}`);
};

/**
 * Create a new post
 * @param {Object} postData - Post data (title, content, category, image)
 */
export const createPost = async (postData) => {
  return fetchAPI('/feed/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

/**
 * Update a post
 * @param {number} postId - Post ID
 * @param {Object} postData - Updated post data
 */
export const updatePost = async (postId, postData) => {
  return fetchAPI(`/feed/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(postData),
  });
};

/**
 * Delete a post
 * @param {number} postId - Post ID
 */
export const deletePost = async (postId) => {
  return fetchAPI(`/feed/posts/${postId}`, {
    method: 'DELETE',
  });
};

/**
 * Like or unlike a post
 * @param {number} postId - Post ID
 */
export const togglePostLike = async (postId) => {
  return fetchAPI(`/feed/posts/${postId}/like`, {
    method: 'POST',
  });
};

/**
 * Get all comments for a post
 * @param {number} postId - Post ID
 */
export const getPostComments = async (postId) => {
  return fetchAPI(`/feed/posts/${postId}/comments`);
};

/**
 * Add a comment to a post
 * @param {number} postId - Post ID
 * @param {string} text - Comment text
 */
export const addComment = async (postId, text) => {
  return fetchAPI(`/feed/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

/**
 * Delete a comment
 * @param {number} commentId - Comment ID
 */
export const deleteComment = async (commentId) => {
  return fetchAPI(`/feed/comments/${commentId}`, {
    method: 'DELETE',
  });
};

/**
 * Like or unlike a comment
 * @param {number} commentId - Comment ID
 */
export const toggleCommentLike = async (commentId) => {
  return fetchAPI(`/feed/comments/${commentId}/like`, {
    method: 'POST',
  });
};

/**
 * Get all feed categories
 */
export const getFeedCategories = async () => {
  return fetchAPI('/feed/categories');
};

// Export feed categories (could be fetched from backend in the future)
export const feedCategories = ['All', 'General', 'Marketplace', 'Lost and Found', 'Roommate Request', 'Safety Alerts'];

