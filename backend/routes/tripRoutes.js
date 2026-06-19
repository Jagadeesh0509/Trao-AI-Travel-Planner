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
} = require('../controllers/tripController');

// All routes are protected by JWT auth middleware
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

module.exports = router;
