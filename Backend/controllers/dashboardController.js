const pool = require('../config/db');

/**
 * GET DASHBOARD KPIs
 */
exports.getKPIs = async (req, res) => {
  try {
    const [activeFleet] = await pool.query(
      "SELECT COUNT(*) AS count FROM vehicles WHERE status = 'On Trip'"
    );

    const [maintenanceAlerts] = await pool.query(
      "SELECT COUNT(*) AS count FROM vehicles WHERE status = 'In Shop'"
    );

    const [totalFleet] = await pool.query(
      "SELECT COUNT(*) AS total FROM vehicles WHERE status != 'Out of Service'"
    );

    const [assignedFleet] = await pool.query(
      "SELECT COUNT(*) AS assigned FROM vehicles WHERE status = 'On Trip'"
    );

    const utilizationRate =
      totalFleet[0].total === 0
        ? 0
        : ((assignedFleet[0].assigned / totalFleet[0].total) * 100).toFixed(2);

    const [pendingCargo] = await pool.query(
      "SELECT COUNT(*) AS count FROM trips WHERE status = 'Draft'"
    );

    return res.status(200).json({
      activeFleet: activeFleet[0].count,
      maintenanceAlerts: maintenanceAlerts[0].count,
      utilizationRate,
      pendingCargo: pendingCargo[0].count
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};