const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateNewTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
  getPublicTripById,
  duplicateTrip,
  chatWithTripAssistant,
  getTripWeather,
  getTripRecommendations,
  regenerateTripPackingList,
} = require('../controllers/tripController');

// @route   GET  /api/trips/public/:id
// @desc    Get a public shared trip (no auth required)
router.get('/public/:id', getPublicTripById);

// All routes below are protected by JWT auth middleware
router.use(auth);

// @route   GET  /api/trips
router.get('/', getUserTrips);

// @route   POST /api/trips
router.post('/', generateNewTrip);

// @route   GET  /api/trips/:id
router.get('/:id', getTripById);

// @route   PUT  /api/trips/:id
router.put('/:id', updateTrip);

// @route   DELETE /api/trips/:id
router.delete('/:id', deleteTrip);

// @route   POST /api/trips/:id/regenerate-day
router.post('/:id/regenerate-day', regenerateDay);

// @route   POST /api/trips/:id/duplicate
router.post('/:id/duplicate', duplicateTrip);

// @route   POST /api/trips/:id/chat
router.post('/:id/chat', chatWithTripAssistant);

// @route   GET  /api/trips/:id/weather
router.get('/:id/weather', getTripWeather);

// @route   GET  /api/trips/:id/recommendations
router.get('/:id/recommendations', getTripRecommendations);

// @route   POST /api/trips/:id/regenerate-packing
router.post('/:id/regenerate-packing', regenerateTripPackingList);

module.exports = router;
