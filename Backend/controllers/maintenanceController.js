const pool = require('../config/db');

/**
 * GET ALL MAINTENANCE LOGS (service_logs)
 */
exports.getMaintenanceLogs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.*, v.license_plate, v.name_model
      FROM service_logs s
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      ORDER BY s.date DESC
    `);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addMaintenanceLog = async (req, res) => {
  try {
    const { vehicle_id, description, cost, date } = req.body;

    await pool.query(
      `INSERT INTO service_logs (vehicle_id, description, cost, date)
       VALUES (?, ?, ?, ?)`,
      [vehicle_id, description, cost, date]
    );

    await pool.query(
      "UPDATE vehicles SET status = 'In Shop' WHERE id = ?",
      [vehicle_id]
    );

    return res.status(201).json({ message: 'Maintenance logged successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};