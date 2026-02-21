const express = require('express');
const router = express.Router();

const {
  getDrivers,
  addDriver,
  updateDriverStatus
} = require('../controllers/driverController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/drivers
 * Manager & Dispatcher (Dispatcher needs list for trip creation)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  getDrivers
);

/**
 * POST /api/drivers
 * Manager only
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Manager']),
  addDriver
);

/**
 * PATCH /api/drivers/:id/status
 * Manager only
 */
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['Manager']),
  updateDriverStatus
);

module.exports = router;