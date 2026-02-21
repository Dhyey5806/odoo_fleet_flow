const express = require('express');
const router = express.Router();

const {
  getVehicles,
  addVehicle,
  updateVehicleStatus
} = require('../controllers/vehicleController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/vehicles
 * Manager & Dispatcher (Dispatcher needs list for trip creation)
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  getVehicles
);

/**
 * POST /api/vehicles
 * Manager only
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Manager']),
  addVehicle
);

/**
 * PATCH /api/vehicles/:id/status
 * Manager only
 */
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(['Manager']),
  updateVehicleStatus
);

module.exports = router;