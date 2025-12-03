const express = require('express');
const router = express.Router();
const authenticateToken = require('../../middleware/authenticateToken');

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

// Public routes (no authentication required)
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (authentication required)
// User-specific event routes
router.get('/user/rsvps', authenticateToken, getUserRSVPedEvents);
router.get('/user/hosting', authenticateToken, getUserHostedEvents);
router.get('/user/needs-attention', authenticateToken, getEventsNeedingAttention);
router.get('/user/past', authenticateToken, getUserPastEvents);

// Core event routes (create/update/delete require auth)
router.post('/', authenticateToken, createEvent);
router.put('/:id', authenticateToken, updateEvent);
router.delete('/:id', authenticateToken, deleteEvent);

// RSVP routes
router.post('/:id/rsvp', authenticateToken, rsvpToEvent);
router.delete('/:id/rsvp', authenticateToken, cancelRSVP);
router.get('/:id/rsvps', authenticateToken, getEventRSVPs);
router.get('/:id/rsvp-status', authenticateToken, checkRSVPStatus);

// Survey routes
router.post('/:id/survey', authenticateToken, submitSurvey);
router.get('/:id/surveys', authenticateToken, getEventSurveys);
router.get('/:id/survey-status', authenticateToken, checkSurveyStatus);

// Analytics routes
router.get('/:id/analytics', authenticateToken, getEventAnalytics);
router.post('/:id/checkin', authenticateToken, checkInToEvent);

module.exports = router;

