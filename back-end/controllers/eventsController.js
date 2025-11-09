const { mockEvents, getNextEventId } = require('../data/mockEvents');

/**
 * GET /api/events
 * Get all events with optional filtering and sorting
 */
const getAllEvents = (req, res) => {
  try {
    const { category, search, sort, showPast } = req.query;
    
    let filteredEvents = [...mockEvents];

    // Filter by category
    if (category && category !== 'All') {
      filteredEvents = filteredEvents.filter(event => 
        event.category.includes(category)
      );
    }

    // Filter by search term (searches in title)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(searchLower)
      );
    }

    // Filter past events (by default, only show upcoming)
    if (showPast !== 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
      });
    }

    // Sort events
    if (sort === 'latest') {
      filteredEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'oldest') {
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === 'engagement') {
      filteredEvents.sort((a, b) => b.rsvpCount - a.rsvpCount);
    } else {
      // Default: sort by date ascending (soonest first)
      filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    res.status(200).json({
      success: true,
      count: filteredEvents.length,
      data: filteredEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching events'
    });
  }
};

/**
 * GET /api/events/:id
 * Get a single event by ID
 */
const getEventById = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = mockEvents.find(e => e.id === eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching event'
    });
  }
};

/**
 * POST /api/events
 * Create a new event
 */
const createEvent = (req, res) => {
  try {
    const { title, date, time, location, description, category, image } = req.body;

    // Validation
    if (!title || !date || !time || !location || !description) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: title, date, time, location, description'
      });
    }

    if (!category || category.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one category'
      });
    }

    // Create new event
    const newEvent = {
      id: getNextEventId(),
      title,
      date,
      time,
      location,
      description,
      category: Array.isArray(category) ? category : [category],
      image: image || `https://picsum.photos/seed/event${getNextEventId()}/400/300`,
      rsvpCount: 0,
      host: {
        name: 'Current User', // TODO: Get from auth
        avatar: 'https://picsum.photos/seed/currentuser/50/50',
        userId: 'user123' // TODO: Get from auth
      },
      isPast: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockEvents.push(newEvent);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while creating event'
    });
  }
};

/**
 * PUT /api/events/:id
 * Update an event
 */
const updateEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = mockEvents[eventIndex];

    // Check if user is the host (simple auth check)
    // TODO: Implement proper authentication
    const currentUserId = 'user123'; // Mock user ID
    if (event.host.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this event'
      });
    }

    // Update fields
    const { title, date, time, location, description, category, image } = req.body;
    
    if (title) event.title = title;
    if (date) event.date = date;
    if (time) event.time = time;
    if (location) event.location = location;
    if (description) event.description = description;
    if (category) event.category = Array.isArray(category) ? category : [category];
    if (image) event.image = image;
    
    event.updatedAt = new Date();

    mockEvents[eventIndex] = event;

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating event'
    });
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event
 */
const deleteEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    const event = mockEvents[eventIndex];

    // Check if user is the host
    const currentUserId = 'user123'; // Mock user ID
    if (event.host.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this event'
      });
    }

    mockEvents.splice(eventIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while deleting event'
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};

