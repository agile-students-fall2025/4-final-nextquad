const Event = require('../../models/Event');

/**
 * Helper function to parse event date and time into a Date object
 * @param {string} dateStr - Date string in "YYYY-MM-DD" format
 * @param {string} timeStr - Time string in "3:30 PM" format
 * @returns {Date|null} - Parsed Date object or null if invalid
 */
const parseEventDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  
  try {
    // Parse date (YYYY-MM-DD)
    const [year, month, day] = dateStr.split('-').map(Number);
    
    // Parse time (e.g., "8:00 PM" or "3:30 PM")
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!timeMatch) return null;
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return new Date(year, month - 1, day, hours, minutes);
  } catch (error) {
    console.error('Error parsing event date/time:', error);
    return null;
  }
};

/**
 * Check if an event is in the past (considering both date and time)
 * @param {Object} event - Event object with date and time properties
 * @returns {boolean} - True if event is in the past
 */
const isEventPast = (event) => {
  if (!event.date || !event.time) return false;
  const eventDateTime = parseEventDateTime(event.date, event.time);
  if (!eventDateTime) return false;
  const now = new Date();
  return eventDateTime < now;
};

/**
 * POST /api/events/:id/rsvp
 * RSVP to an event
 */
const rsvpToEvent = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is in the past (considering both date and time)
    if (isEventPast(event)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot RSVP to past events'
      });
    }

    // Check if user is the host
    if (event.isHost(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot RSVP to event as host'
      });
    }

    // Check if user has already RSVP'd
    if (event.hasUserRSVPd(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already RSVP\'d to this event'
      });
    }

    // Add RSVP to the rsvps array
    event.rsvps.push({
      userId,
      rsvpedAt: new Date()
    });
    
    // Increment RSVP count
    event.rsvpCount = (event.rsvpCount || 0) + 1;

    await event.save();

    res.status(200).json({
      success: true,
      message: 'RSVP successful',
      data: {
        eventId: event._id,
        userId,
        rsvpedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error in rsvpToEvent:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while RSVP\'ing to event'
    });
  }
};

/**
 * DELETE /api/events/:id/rsvp
 * Cancel RSVP to an event
 */
const cancelRSVP = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if RSVP exists
    if (!event.hasUserRSVPd(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have not RSVP\'d to this event'
      });
    }

    // Remove RSVP from the array
    event.rsvps = event.rsvps.filter(rsvp => rsvp.userId !== userId);
    
    // Decrement RSVP count
    event.rsvpCount = Math.max(0, (event.rsvpCount || 0) - 1);

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Successfully cancelled RSVP',
      data: {
        eventId: event._id,
        rsvpCount: event.rsvpCount
      }
    });
  } catch (error) {
    console.error('Error in cancelRSVP:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling RSVP'
    });
  }
};

/**
 * GET /api/events/:id/rsvps
 * Get all RSVPs for an event (for hosts)
 */
const getEventRSVPs = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the host
    if (!event.isHost(userId)) {
      return res.status(403).json({
        success: false,
        error: 'Only the event host can view RSVPs'
      });
    }

    // Get RSVPs from the event
    const rsvps = event.rsvps || [];

    // In a real app, we would fetch user details for each RSVP from User model
    // For now, we'll return mock user data
    const rsvpDetails = rsvps.map((rsvp) => ({
      userId: rsvp.userId,
      name: `User ${rsvp.userId}`,
      email: `${rsvp.userId}@nyu.edu`,
      rsvpDate: rsvp.rsvpedAt
    }));

    res.status(200).json({
      success: true,
      count: rsvpDetails.length,
      data: rsvpDetails
    });
  } catch (error) {
    console.error('Error in getEventRSVPs:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching RSVPs'
    });
  }
};

/**
 * GET /api/events/:id/rsvp-status
 * Check if current user has RSVP'd to an event
 */
const checkRSVPStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has RSVP'd
    const hasRSVPd = event.hasUserRSVPd(userId);
    
    // Check if user is the host
    const isHost = event.isHost(userId);

    // Check if event is past (considering both date and time)
    const eventIsPast = isEventPast(event);

    res.status(200).json({
      success: true,
      data: {
        hasRSVPd,
        isHost,
        canRSVP: !hasRSVPd && !isHost && !eventIsPast
      }
    });
  } catch (error) {
    console.error('Error in checkRSVPStatus:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while checking RSVP status'
    });
  }
};

module.exports = {
  rsvpToEvent,
  cancelRSVP,
  getEventRSVPs,
  checkRSVPStatus
};
