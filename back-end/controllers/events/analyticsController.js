const { mockEvents, mockRSVPs } = require('../../data/events/mockEvents');

// In-memory storage (in production, this would be from database)
// Mock check-in data: eventId -> array of userIds who checked in
// Note: Check-ins should only include users who have RSVP'd
let mockCheckIns = {
  100: ['user123'] // Past event has 1 check-in (user123 RSVP'd and attended)
};

/**
 * GET /api/events/:id/analytics
 * Get analytics data for a specific event (host only)
 */
const getEventAnalytics = (req, res) => {
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

    // Get RSVP data
    const rsvpList = mockRSVPs[eventId] || [];
    const totalRSVPs = rsvpList.length;

    // Get check-in data
    const checkInList = mockCheckIns[eventId] || [];
    const totalCheckIns = checkInList.length;

    // Calculate check-in rate
    const checkInRate = totalRSVPs > 0 
      ? ((totalCheckIns / totalRSVPs) * 100).toFixed(1)
      : '0.0';

    // Get survey data (import from surveyController's storage)
    // For now, we'll calculate it here
    const surveys = require('./surveyController').getSurveysForAnalytics(eventId);
    const averageRating = surveys.length > 0
      ? (surveys.reduce((sum, s) => sum + s.rating, 0) / surveys.length).toFixed(1)
      : '0.0';

    // Generate mock RSVP timeline data (in production, this would be from database)
    const rsvpTimeline = [
      { day: 'Mon', count: Math.floor(totalRSVPs * 0.2) },
      { day: 'Tue', count: Math.floor(totalRSVPs * 0.3) },
      { day: 'Wed', count: Math.floor(totalRSVPs * 0.5) },
      { day: 'Thu', count: Math.floor(totalRSVPs * 0.7) },
      { day: 'Fri', count: totalRSVPs }
    ];

    // Generate insights
    const insights = [];
    
    // Peak RSVP day insight
    const peakDay = rsvpTimeline.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    , rsvpTimeline[0]);
    insights.push({
      icon: '↑',
      text: `Peak RSVP day was ${peakDay.day} with ${peakDay.count} RSVPs`
    });

    // Check-in rate insight
    if (event.isPast) {
      const checkInPercentage = parseFloat(checkInRate);
      if (checkInPercentage > 75) {
        insights.push({
          icon: '✓',
          text: `Excellent attendance with ${checkInRate}% check-in rate`
        });
      } else if (checkInPercentage > 50) {
        insights.push({
          icon: '•',
          text: `Good attendance with ${checkInRate}% check-in rate`
        });
      } else {
        insights.push({
          icon: '⚠',
          text: `Low attendance with ${checkInRate}% check-in rate`
        });
      }
    }

    // Survey insight
    if (surveys.length > 0) {
      const rating = parseFloat(averageRating);
      if (rating >= 4.0) {
        insights.push({
          icon: '★',
          text: `Highly rated event with ${averageRating}/5.0 average rating from ${surveys.length} responses`
        });
      } else if (rating >= 3.0) {
        insights.push({
          icon: '•',
          text: `${averageRating}/5.0 average rating from ${surveys.length} survey responses`
        });
      }
    } else if (event.isPast) {
      insights.push({
        icon: '📋',
        text: 'No survey responses yet. Consider sending a follow-up to attendees.'
      });
    }

    // Response data
    const analytics = {
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        isPast: event.isPast
      },
      metrics: {
        totalRSVPs,
        totalCheckIns,
        checkInRate: `${checkInRate}%`,
        averageRating: averageRating !== '0.0' ? `${averageRating}★` : 'N/A',
        totalSurveys: surveys.length
      },
      rsvpTimeline,
      insights,
      surveys: surveys.map(s => ({
        rating: s.rating,
        enjoyedAspects: s.enjoyedAspects,
        feedback: s.feedback,
        submittedAt: s.submittedAt
      }))
    };

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching analytics'
    });
  }
};

/**
 * POST /api/events/:id/checkin
 * Record a check-in for an event
 */
const checkInToEvent = (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = 'user123'; // Mock user ID
    
    // Check if event exists
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user has RSVP'd
    const rsvpList = mockRSVPs[eventId] || [];
    if (!rsvpList.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must RSVP to this event before checking in'
      });
    }

    // Initialize check-in list if doesn't exist
    if (!mockCheckIns[eventId]) {
      mockCheckIns[eventId] = [];
    }

    // Check if already checked in
    if (mockCheckIns[eventId].includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in to this event'
      });
    }

    // Record check-in
    mockCheckIns[eventId].push(userId);

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: {
        eventId,
        userId,
        checkedInAt: new Date()
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while checking in'
    });
  }
};

module.exports = {
  getEventAnalytics,
  checkInToEvent
};

