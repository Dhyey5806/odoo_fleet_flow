const express = require('express');
const router = express.Router();

const { getVehicleAnalytics } = require('../controllers/analyticsController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/analytics
 * Admin & Manager
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Admin', 'Manager']),
  getVehicleAnalytics
);

module.exports = router;