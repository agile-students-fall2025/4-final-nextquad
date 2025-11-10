const { mockEvents } = require('../../data/events/mockEvents');

// In-memory storage for surveys (in production, this would be in a database)
let mockSurveys = [];

/**
 * POST /api/events/:id/survey
 * Submit survey feedback for an event
 */
const submitSurvey = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { rating, enjoyedAspects, feedback } = req.body;
    const userId = 'user123'; // TODO: Get from auth
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid rating (1-5)'
      });
    }

    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has already submitted a survey for this event
    const existingSurvey = mockSurveys.find(
      s => s.eventId === eventId && s.userId === userId
    );
    if (existingSurvey) {
      return res.status(400).json({
        success: false,
        error: 'You have already submitted a survey for this event'
      });
    }

    // Create survey response
    const surveyResponse = {
      id: mockSurveys.length + 1,
      eventId,
      userId,
      rating,
      enjoyedAspects: enjoyedAspects || [],
      feedback: feedback || '',
      submittedAt: new Date()
    };

    mockSurveys.push(surveyResponse);

    res.status(201).json({
      success: true,
      message: 'Survey submitted successfully',
      data: surveyResponse
    });
  } catch (error) {
    console.error('Survey submission error:', error);
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
const getEventSurveys = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is the host
    const currentUserId = 'user123'; // Mock user ID
    if (event.host.userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        error: 'Only the host can view survey responses'
      });
    }

    // Get all surveys for this event
    const eventSurveys = mockSurveys.filter(s => s.eventId === eventId);

    // Calculate average rating
    const avgRating = eventSurveys.length > 0
      ? eventSurveys.reduce((sum, s) => sum + s.rating, 0) / eventSurveys.length
      : 0;

    res.status(200).json({
      success: true,
      count: eventSurveys.length,
      averageRating: avgRating.toFixed(1),
      data: eventSurveys
    });
  } catch (error) {
    console.error('Get surveys error:', error);
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
const checkSurveyStatus = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = 'user123'; // TODO: Get from auth
    
    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has submitted survey
    const existingSurvey = mockSurveys.find(
      s => s.eventId === eventId && s.userId === userId
    );

    res.status(200).json({
      success: true,
      data: {
        hasSubmitted: !!existingSurvey,
        survey: existingSurvey || null
      }
    });
  } catch (error) {
    console.error('Check survey status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking survey status'
    });
  }
};

/**
 * Helper function for analytics
 * Get surveys for a specific event (internal use)
 */
const getSurveysForAnalytics = (eventId) => {
  return mockSurveys.filter(s => s.eventId === eventId);
};

module.exports = {
  submitSurvey,
  getEventSurveys,
  checkSurveyStatus,
  getSurveysForAnalytics
};

