const Event = require('../../models/Event');

/**
 * GET /api/events/:id/analytics
 * Get analytics data for a specific event (host only)
 */
const getEventAnalytics = async (req, res) => {
  try {
    // Check if event exists
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Get data from event document
    const rsvpList = event.rsvps || [];
    const totalRSVPs = rsvpList.length;

    const checkInList = event.checkIns || [];
    const totalCheckIns = checkInList.length;

    const surveys = event.surveys || [];

    // Calculate check-in rate
    const checkInRate = totalRSVPs > 0 
      ? ((totalCheckIns / totalRSVPs) * 100).toFixed(1)
      : '0.0';

    // Get average rating from virtual property
    const averageRating = event.averageRating || '0.0';

    // Generate mock RSVP timeline data (in production, aggregate by rsvpedAt date)
    // For now, simulate timeline based on total RSVPs
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
    if (totalRSVPs > 0) {
    const peakDay = rsvpTimeline.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    , rsvpTimeline[0]);
    insights.push({
      icon: '↑',
      text: `Peak RSVP day was ${peakDay.day} with ${peakDay.count} RSVPs`
    });
    }

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
      } else if (totalCheckIns > 0) {
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
      } else if (rating > 0) {
        insights.push({
          icon: '⚠',
          text: `Below average rating of ${averageRating}/5.0 from ${surveys.length} responses`
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
        id: event._id,
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
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
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
const checkInToEvent = async (req, res) => {
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
    if (!event.hasUserRSVPd(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must RSVP to this event before checking in'
      });
    }

    // Check if already checked in
    if (event.hasUserCheckedIn(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in to this event'
      });
    }

    // Record check-in
    event.checkIns.push({
      userId,
      checkedInAt: new Date()
    });

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: {
        eventId: event._id,
        userId,
        checkedInAt: new Date()
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
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
