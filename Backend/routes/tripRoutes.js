const express = require('express');
const router = express.Router();

const {
  getTrips,
  createTrip,
  completeTrip
} = require('../controllers/tripController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/trips
 * Manager & Dispatcher
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  getTrips
);

/**
 * POST /api/trips
 * Dispatcher (Manager can also access if needed)
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  createTrip
);

/**
 * PATCH /api/trips/:id/complete
 * Dispatcher (Manager allowed too)
 */
router.patch(
  '/:id/complete',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  completeTrip
);

module.exports = router;