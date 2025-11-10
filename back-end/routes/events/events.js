const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../../controllers/events/eventsController');
const {
  getUserRSVPedEvents,
  getUserHostedEvents,
  getEventsNeedingAttention,
  getUserPastEvents
} = require('../../controllers/events/userEventsController');
const {
  rsvpToEvent,
  cancelRSVP,
  getEventRSVPs,
  checkRSVPStatus
} = require('../../controllers/events/rsvpController');
const {
  submitSurvey,
  getEventSurveys,
  checkSurveyStatus
} = require('../../controllers/events/surveyController');
const {
  getEventAnalytics,
  checkInToEvent
} = require('../../controllers/events/analyticsController');

// User-specific event routes (must come before /:id route)
router.get('/user/rsvps', getUserRSVPedEvents);
router.get('/user/hosting', getUserHostedEvents);
router.get('/user/needs-attention', getEventsNeedingAttention);
router.get('/user/past', getUserPastEvents);

// Core event routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// RSVP routes (must come after core routes but before catch-all)
router.post('/:id/rsvp', rsvpToEvent);
router.delete('/:id/rsvp', cancelRSVP);
router.get('/:id/rsvps', getEventRSVPs);
router.get('/:id/rsvp-status', checkRSVPStatus);

// Survey routes
router.post('/:id/survey', submitSurvey);
router.get('/:id/surveys', getEventSurveys);
router.get('/:id/survey-status', checkSurveyStatus);

// Analytics routes
router.get('/:id/analytics', getEventAnalytics);
router.post('/:id/checkin', checkInToEvent);

module.exports = router;

