const Event = require('../../models/Event');

// Mock user ID (in real app, this would come from authentication)
const MOCK_USER_ID = process.env.MOCK_USER_ID || 'user123';

/**
 * GET /api/events/user/rsvps
 * Get events the user has RSVP'd to (attending) - only upcoming events
 */
const getUserRSVPedEvents = async (req, res) => {
  try {
    // TODO: Get userId from authentication middleware (req.user.id)
    const userId = MOCK_USER_ID;

    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Find all events where user has RSVP'd and event is upcoming
    const userRSVPedEvents = await Event.find({
      'rsvps.userId': userId,
      date: { $gte: today }
    }).sort({ date: 1 }); // Sort by date (soonest first)

    res.status(200).json({
      success: true,
      count: userRSVPedEvents.length,
      data: userRSVPedEvents
    });
  } catch (error) {
    console.error('Error in getUserRSVPedEvents:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No events found'
    });
  }
};

/**
 * GET /api/events/user/hosting
 * Get events the user is hosting - only upcoming events
 */
const getUserHostedEvents = async (req, res) => {
  try {
    // TODO: Get userId from authentication middleware (req.user.id)
    const userId = MOCK_USER_ID;

    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Find all events where user is the host and event is upcoming
    const hostedEvents = await Event.find({
      'host.userId': userId,
      date: { $gte: today }
    }).sort({ date: 1 }); // Sort by date (soonest first)

    res.status(200).json({
      success: true,
      count: hostedEvents.length,
      data: hostedEvents
    });
  } catch (error) {
    console.error('Error in getUserHostedEvents:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No events found'
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
const getEventsNeedingAttention = async (req, res) => {
  try {
    // TODO: Get userId from authentication middleware (req.user.id)
    const userId = MOCK_USER_ID;

    const now = new Date();
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);
    const todayStr = todayMidnight.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Find all events where user has RSVP'd
    const allUserEvents = await Event.find({
      'rsvps.userId': userId
    });

    // Filter and categorize events
    const needsCheckIn = [];
    const needsSurvey = [];

    for (const event of allUserEvents) {
      // Parse date with time for accurate check-in window calculation
      const eventDateTime = parseEventDateTime(event.date, event.time);
      if (!eventDateTime) continue; // Skip if parsing failed
      
      const eventDateOnly = new Date(event.date);
      const isPast = event.date < todayStr;

      // For upcoming events: check if it's within 24 hours (needs check-in)
      // And user hasn't checked in yet
      if (!isPast) {
        const hoursDiff = (eventDateTime - now) / (1000 * 60 * 60);
        const withinCheckInWindow = hoursDiff <= 24 && hoursDiff >= 0;
        const hasCheckedIn = event.hasUserCheckedIn(userId);
        
        if (withinCheckInWindow && !hasCheckedIn) {
          needsCheckIn.push({
            ...event.toObject(),
            needsCheckIn: true
          });
        }
      }

      // For past events: check if survey hasn't been completed
      if (isPast) {
        const hasSubmittedSurvey = event.hasUserSubmittedSurvey(userId);
        
        if (!hasSubmittedSurvey) {
          needsSurvey.push({
            ...event.toObject(),
            needsSurvey: true
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      needsCheckIn,
      needsSurvey
    });
  } catch (error) {
    console.error('Error in getEventsNeedingAttention:', error);
    res.status(200).json({
      success: true,
      needsCheckIn: [],
      needsSurvey: []
    });
  }
};

/**
 * GET /api/events/user/past
 * Get user's past events (events they RSVP'd to that have already happened)
 */
const getUserPastEvents = async (req, res) => {
  try {
    // TODO: Get userId from authentication middleware (req.user.id)
    const userId = MOCK_USER_ID;

    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Find all past events where user has RSVP'd
    const pastEvents = await Event.find({
      'rsvps.userId': userId,
      date: { $lt: today }
    }).sort({ date: -1 }); // Sort by date (most recent first)

    res.status(200).json({
      success: true,
      count: pastEvents.length,
      data: pastEvents
    });
  } catch (error) {
    console.error('Error in getUserPastEvents:', error);
    res.status(200).json({
      success: true,
      count: 0,
      data: [],
      message: 'No events found'
    });
  }
};

module.exports = {
  getUserRSVPedEvents,
  getUserHostedEvents,
  getEventsNeedingAttention,
  getUserPastEvents
};
