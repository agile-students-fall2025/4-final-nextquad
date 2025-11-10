const { mockEvents, mockRSVPs } = require('../data/events/mockEvents');

// Mock user ID (in real app, this would come from authentication)
const MOCK_USER_ID = process.env.MOCK_USER_ID || 'user123';

/**
 * GET /api/events/user/rsvps
 * Get events the user has RSVP'd to (attending) - only upcoming events
 */
const getUserRSVPedEvents = (req, res) => {
  try {
    // TODO: Get userId from authentication middleware
    const userId = MOCK_USER_ID;

    // Find all events where user has RSVP'd
    const userRSVPedEvents = mockEvents.filter(event => {
      const hasRSVPd = mockRSVPs[event.id] && mockRSVPs[event.id].includes(userId);
      
      // Only include upcoming events
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isUpcoming = eventDate >= today;
      
      return hasRSVPd && isUpcoming;
    });

    // Sort by date (soonest first)
    userRSVPedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      count: userRSVPedEvents.length,
      data: userRSVPedEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user RSVP\'d events'
    });
  }
};

/**
 * GET /api/events/user/hosting
 * Get events the user is hosting - only upcoming events
 */
const getUserHostedEvents = (req, res) => {
  try {
    // TODO: Get userId from authentication middleware
    const userId = MOCK_USER_ID;

    // Find all events where user is the host
    const hostedEvents = mockEvents.filter(event => {
      const isHost = event.host.userId === userId;
      
      // Only include upcoming events
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isUpcoming = eventDate >= today;
      
      return isHost && isUpcoming;
    });

    // Sort by date (soonest first)
    hostedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      count: hostedEvents.length,
      data: hostedEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user hosted events'
    });
  }
};

/**
 * GET /api/events/user/needs-attention
 * Get events that need user attention (check-in required or survey needed)
 * Includes both upcoming events (check-in) and past events (survey)
 */
const getEventsNeedingAttention = (req, res) => {
  try {
    // TODO: Get userId from authentication middleware
    const userId = MOCK_USER_ID;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find events where user has RSVP'd and needs to take action
    const needsAttentionEvents = mockEvents.filter(event => {
      const hasRSVPd = mockRSVPs[event.id] && mockRSVPs[event.id].includes(userId);
      
      if (!hasRSVPd) return false;

      const eventDate = new Date(event.date);
      const isUpcoming = eventDate >= today;
      const isPast = eventDate < today;

      // For upcoming events: check if it's within 24 hours (needs check-in)
      const hoursDiff = (eventDate - today) / (1000 * 60 * 60);
      const needsCheckIn = isUpcoming && hoursDiff <= 24;

      // For past events: check if survey hasn't been completed
      // In this mock, we'll assume all past RSVP'd events need surveys
      const needsSurvey = isPast;

      // Add flags to the event object
      if (needsCheckIn || needsSurvey) {
        return true;
      }

      return false;
    }).map(event => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < today;
      const hoursDiff = (eventDate - today) / (1000 * 60 * 60);
      
      return {
        ...event,
        needsCheckIn: !isPast && hoursDiff <= 24,
        needsSurvey: isPast
      };
    });

    // Sort: upcoming events first (by date), then past events
    needsAttentionEvents.sort((a, b) => {
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      const aIsPast = aDate < today;
      const bIsPast = bDate < today;

      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return aDate - bDate;
    });

    res.status(200).json({
      success: true,
      count: needsAttentionEvents.length,
      data: needsAttentionEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching events needing attention'
    });
  }
};

/**
 * GET /api/events/user/past
 * Get user's past events (events they RSVP'd to that have already happened)
 */
const getUserPastEvents = (req, res) => {
  try {
    // TODO: Get userId from authentication middleware
    const userId = MOCK_USER_ID;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all past events where user has RSVP'd
    const pastEvents = mockEvents.filter(event => {
      const hasRSVPd = mockRSVPs[event.id] && mockRSVPs[event.id].includes(userId);
      const eventDate = new Date(event.date);
      const isPast = eventDate < today;
      
      return hasRSVPd && isPast;
    });

    // Sort by date (most recent first)
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: pastEvents.length,
      data: pastEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching user past events'
    });
  }
};

module.exports = {
  getUserRSVPedEvents,
  getUserHostedEvents,
  getEventsNeedingAttention,
  getUserPastEvents
};

