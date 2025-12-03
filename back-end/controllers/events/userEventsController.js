const Event = require('../../models/Event');

/**
 * GET /api/events/user/rsvps
 * Get events the user has RSVP'd to (attending) - only upcoming events
 */
const getUserRSVPedEvents = async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.user.userId;

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
 * Get all events the user is hosting (including past events)
 */
const getUserHostedEvents = async (req, res) => {
  try {
    // Get userId from authentication middleware
    const userId = req.user.userId;

    // Find all events where user is the host (no date filter)
    const hostedEvents = await Event.find({
      'host.userId': userId
    }).sort({ date: -1 }); // Sort by date (most recent first)

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
    // Get userId from authentication middleware
    const userId = req.user.userId;

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
      const eventDateOnly = event.date; // "YYYY-MM-DD" string
      const isPastDate = eventDateOnly < todayStr;
      const isUpcoming = eventDateOnly >= todayStr; // Today or future

      // For upcoming events (today or future): show in check-in list
      if (isUpcoming) {
        needsCheckIn.push({
          ...event.toObject(),
          needsCheckIn: true
        });
      }

      // For past events: check if user hasn't completed survey
      if (isPastDate) {
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
    // Get userId from authentication middleware
    const userId = req.user.userId;

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
