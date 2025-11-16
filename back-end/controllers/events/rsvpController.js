const { mockEvents, mockRSVPs } = require('../../data/events/mockEvents');

// Mock user ID (in real app, this would come from authentication)
const MOCK_USER_ID = process.env.MOCK_USER_ID || 'user123';

/**
 * POST /api/events/:id/rsvp
 * RSVP to an event
 */
const rsvpToEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware

    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
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
    if (event.host.userId === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot RSVP to event as host'
      });
    }

    // Initialize RSVP array for this event if it doesn't exist
    if (!mockRSVPs[eventId]) {
      mockRSVPs[eventId] = [];
    }

    // Check if user has already RSVP'd
    if (mockRSVPs[eventId].includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already RSVP\'d to this event'
      });
    }

    // Add RSVP
    mockRSVPs[eventId].push(userId);
    
    // Update event's RSVP count (increment the existing count)
    event.rsvpCount = (event.rsvpCount || 0) + 1;

    res.status(200).json({
      success: true,
      message: 'RSVP successful',
      data: {
        eventId,
        userId,
        rsvpedAt: new Date()
      }
    });
  } catch (error) {
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
const cancelRSVP = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware

    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if RSVP exists
    if (!mockRSVPs[eventId] || !mockRSVPs[eventId].includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have not RSVP\'d to this event'
      });
    }

    // Remove RSVP
    mockRSVPs[eventId] = mockRSVPs[eventId].filter(id => id !== userId);
    
    // Update event's RSVP count (decrement the existing count)
    event.rsvpCount = Math.max(0, (event.rsvpCount || 0) - 1);

    res.status(200).json({
      success: true,
      message: 'Successfully cancelled RSVP',
      data: {
        eventId,
        rsvpCount: event.rsvpCount
      }
    });
  } catch (error) {
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
const getEventRSVPs = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware

    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the host
    if (event.host.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Only the event host can view RSVPs'
      });
    }

    // Get RSVPs for this event
    const rsvps = mockRSVPs[eventId] || [];

    // In a real app, we would fetch user details for each RSVP
    // For now, we'll return mock user data
    const rsvpDetails = rsvps.map((userId, index) => ({
      userId,
      name: `User ${userId}`,
      email: `${userId}@nyu.edu`,
      rsvpDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 7 days
    }));

    res.status(200).json({
      success: true,
      count: rsvpDetails.length,
      data: rsvpDetails
    });
  } catch (error) {
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
const checkRSVPStatus = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = MOCK_USER_ID; // TODO: Get from auth middleware

    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has RSVP'd
    const hasRSVPd = mockRSVPs[eventId] && mockRSVPs[eventId].includes(userId);
    
    // Check if user is the host
    const isHost = event.host.userId === userId;

    res.status(200).json({
      success: true,
      data: {
        hasRSVPd,
        isHost,
        canRSVP: !hasRSVPd && !isHost && new Date(event.date) >= new Date()
      }
    });
  } catch (error) {
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

