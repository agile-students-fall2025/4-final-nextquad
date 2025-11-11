// routes/campus_map/mapRoutes.js
const express = require('express');
const router = express.Router();

// Controllers
const { getCategories } = require('../../controllers/campus_map/mapCategoriesController');
const { getPoints, getPointById, searchPoints } = require('../../controllers/campus_map/mapPinsController');

// Category routes
// GET /api/map/categories
router.get('/categories', getCategories);

// Map point routes
// GET /api/map/points?categories=Food,Elevator&search=ramen
router.get('/points', getPoints);

// GET /api/map/points/:id
router.get('/points/:id', getPointById);

// Search routes
// GET /api/map/search?q=library
router.get('/search', searchPoints);

module.exports = router;
