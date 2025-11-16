const { mockEvents, mockRSVPs } = require('../../data/events/mockEvents');

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
 * Helper function to parse event date and time correctly
 * Handles 12-hour format like "3:30 PM"
 */
const parseEventDateTime = (dateStr, timeStr) => {
  // Parse date: "2024-11-12"
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Parse time: "3:30 PM" or "11:45 AM"
  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) {
    console.error('Invalid time format:', timeStr);
    return null;
  }
  
  let [, hours, minutes, period] = timeMatch;
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  // Convert to 24-hour format
  if (period.toUpperCase() === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
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

    const now = new Date();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // Find events where user has RSVP'd and needs to take action
    const needsAttentionEvents = mockEvents.filter(event => {
      const hasRSVPd = mockRSVPs[event.id] && mockRSVPs[event.id].includes(userId);
      
      if (!hasRSVPd) return false;

      // Parse date with time for accurate check-in window calculation
      const eventDateTime = parseEventDateTime(event.date, event.time);
      if (!eventDateTime) return false; // Skip if parsing failed
      
      const eventDateOnly = new Date(event.date);
      const isPast = eventDateOnly < todayMidnight;

      // For upcoming events: check if it's within 24 hours (needs check-in)
      // Calculate from current time, not midnight
      const hoursDiff = (eventDateTime - now) / (1000 * 60 * 60);
      const needsCheckIn = !isPast && hoursDiff <= 24 && hoursDiff >= 0;

      // For past events: check if survey hasn't been completed
      // In this mock, we'll assume all past RSVP'd events need surveys
      const needsSurvey = isPast;

      // Add flags to the event object
      if (needsCheckIn || needsSurvey) {
        return true;
      }

      return false;
    }).map(event => {
      // Parse date with time for accurate check-in window calculation
      const eventDateTime = parseEventDateTime(event.date, event.time);
      const eventDateOnly = new Date(event.date);
      const isPast = eventDateOnly < todayMidnight;
      const hoursDiff = eventDateTime ? (eventDateTime - now) / (1000 * 60 * 60) : -1;
      
      return {
        ...event,
        needsCheckIn: eventDateTime && !isPast && hoursDiff <= 24 && hoursDiff >= 0,
        needsSurvey: isPast
      };
    });

    // Separate into two arrays: needsCheckIn and needsSurvey
    const needsCheckIn = needsAttentionEvents.filter(e => e.needsCheckIn);
    const needsSurvey = needsAttentionEvents.filter(e => e.needsSurvey);

    res.status(200).json({
      success: true,
      needsCheckIn,
      needsSurvey
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

