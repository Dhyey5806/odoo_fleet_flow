const express = require('express');
const router = express.Router();

const { getKPIs } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * GET /api/dashboard/kpis
 * Accessible by Manager & Dispatcher
 */
router.get('/kpis', authMiddleware, getKPIs);

module.exports = router;