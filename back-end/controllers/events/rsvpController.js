const Event = require('../../models/Event');

// Mock user ID (in real app, this would come from authentication)
const MOCK_USER_ID = process.env.MOCK_USER_ID || 'user123';

/**
 * POST /api/events/:id/rsvp
 * RSVP to an event
 */
const rsvpToEvent = async (req, res) => {
  try {
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware (req.user.id)

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is in the past
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
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
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware (req.user.id)

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
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware (req.user.id)

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
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware (req.user.id)

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

    res.status(200).json({
      success: true,
      data: {
        hasRSVPd,
        isHost,
        canRSVP: !hasRSVPd && !isHost && new Date(event.date) >= new Date()
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
