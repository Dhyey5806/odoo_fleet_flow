const express = require('express');
const router = express.Router();

const { addFuelLog } = require('../controllers/fuelController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * POST /api/fuel
 * Dispatcher & Manager
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Manager', 'Dispatcher']),
  addFuelLog
);

module.exports = router;