const Event = require('../../models/Event');
const User = require('../../models/User');
const mongoose = require('mongoose');

/**
 * GET /api/events
 * Get all events with optional filtering and sorting
 */
const getAllEvents = async (req, res) => {
  try {
    const { category, search, sort, showPast } = req.query;
    
    // Build query
    const query = {};

    // Filter by category (category is an array in the schema)
    if (category && category !== 'All') {
      query.category = { $in: [category] };
    }

    // Filter by search term (searches in title)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter past events (by default, only show upcoming)
    if (showPast !== 'true') {
      const today = new Date();
      // Use local date format YYYY-MM-DD
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      query.date = { $gte: todayStr };
    }

    // Build sort object
    let sortObj = {};
    if (sort === 'latest') {
      sortObj = { date: -1, createdAt: -1 };
    } else if (sort === 'oldest') {
      sortObj = { date: 1, createdAt: 1 };
    } else if (sort === 'engagement') {
      sortObj = { rsvpCount: -1 };
    } else {
      // Default: sort by date ascending (soonest first)
      sortObj = { date: 1, createdAt: 1 };
    }

    // Fetch events from database
    const events = await Event.find(query).sort(sortObj);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
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
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(id);

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
    console.error('Error fetching event:', error);
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
const createEvent = async (req, res) => {
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

    // Check if event date is in the past
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = eventDate < today;

    // Get user info for host name
    const user = await User.findById(req.user.userId);
    let hostName = 'Current User';
    if (user) {
      if (user.firstName && user.lastName) {
        hostName = `${user.firstName} ${user.lastName}`;
      } else {
        hostName = user.email.split('@')[0]; // Use email username as fallback
      }
    }

    // Create new event
    const newEvent = new Event({
      title,
      date,
      time,
      location,
      description,
      category: Array.isArray(category) ? category : [category],
      image: image || `https://picsum.photos/seed/event${Date.now()}/400/300`,
      rsvpCount: 0,
      host: {
        name: hostName,
        avatar: 'https://picsum.photos/seed/currentuser/50/50',
        userId: req.user.userId
      },
      isPast: isPast
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
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
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the host
    const currentUserId = req.user.userId;
    if (!event.isHost(currentUserId)) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this event'
      });
    }

    // Update fields
    const { title, date, time, location, description, category, image } = req.body;
    
    if (title) event.title = title;
    if (date) {
      event.date = date;
      // Update isPast if date changed
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      event.isPast = eventDate < today;
    }
    if (time) event.time = time;
    if (location) event.location = location;
    if (description) event.description = description;
    if (category) event.category = Array.isArray(category) ? category : [category];
    if (image) event.image = image;
    
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating event:', error);
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
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the host
    const currentUserId = req.user.userId;
    if (!event.isHost(currentUserId)) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
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
