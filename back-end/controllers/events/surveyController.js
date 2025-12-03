const Event = require('../../models/Event');

/**
 * POST /api/events/:id/survey
 * Submit survey feedback for an event
 */
const submitSurvey = async (req, res) => {
  try {
    const { rating, enjoyedAspects, feedback } = req.body;
    const userId = req.user.userId;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating (1-5)'
      });
    }

    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has already submitted a survey for this event
    if (event.hasUserSubmittedSurvey(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted a survey for this event'
      });
    }

    // Create survey response
    const surveyResponse = {
      userId,
      rating,
      enjoyedAspects: enjoyedAspects || [],
      feedback: feedback || '',
      submittedAt: new Date()
    };

    // Add survey to event
    event.surveys.push(surveyResponse);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Survey submitted successfully',
      data: surveyResponse
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while submitting survey'
    });
  }
};

/**
 * GET /api/events/:id/surveys
 * Get all survey responses for an event (host only)
 */
const getEventSurveys = async (req, res) => {
  try {
    // Check if event exists
    const event = await Event.findById(req.params.id);
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
        error: 'Only the host can view survey responses'
      });
    }

    // Get all surveys for this event
    const eventSurveys = event.surveys || [];

    // Calculate average rating using the virtual property
    const avgRating = event.averageRating || 0;

    res.status(200).json({
      success: true,
      count: eventSurveys.length,
      averageRating: avgRating,
      data: eventSurveys
    });
  } catch (error) {
    console.error('Get surveys error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching surveys'
    });
  }
};

/**
 * GET /api/events/:id/survey-status
 * Check if user has submitted a survey for this event
 */
const checkSurveyStatus = async (req, res) => {
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

    // Check if user has submitted survey
    const hasSubmitted = event.hasUserSubmittedSurvey(userId);
    const userSurvey = event.surveys.find(s => s.userId === userId);

    res.status(200).json({
      success: true,
      data: {
        hasSubmitted,
        survey: userSurvey || null
      }
    });
  } catch (error) {
    console.error('Check survey status error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while checking survey status'
    });
  }
};

/**
 * Helper function for analytics
 * Get surveys for a specific event (internal use)
 * @param {String} eventId - MongoDB ObjectId
 * @returns {Promise<Array>} Array of surveys
 */
const getSurveysForAnalytics = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return event ? event.surveys : [];
  } catch (error) {
    console.error('Error getting surveys for analytics:', error);
    return [];
  }
};

module.exports = {
  submitSurvey,
  getEventSurveys,
  checkSurveyStatus,
  getSurveysForAnalytics
};
