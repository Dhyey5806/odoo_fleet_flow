const express = require('express');
const router = express.Router();

const { getMaintenanceLogs, addMaintenanceLog } = require('../controllers/maintenanceController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * GET /api/maintenance
 * Manager only
 */
router.get(
  '/',
  authMiddleware,
  roleMiddleware(['Manager']),
  getMaintenanceLogs
);

/**
 * POST /api/maintenance
 * Manager only
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['Manager']),
  addMaintenanceLog
);

module.exports = router;