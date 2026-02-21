const pool = require('../config/db');

/**
 * ADD DRIVER
 * Schema: name, license_expiry, safety_score, status
 */
exports.addDriver = async (req, res) => {
  try {
    const { name, license_expiry, safety_score } = req.body;

    if (!name || !license_expiry) {
      return res.status(400).json({ message: 'Name and license expiry are required' });
    }

    await pool.query(
      `INSERT INTO drivers (name, license_expiry, safety_score, status)
       VALUES (?, ?, ?, 'On Duty')`,
      [name, license_expiry, safety_score ?? 100]
    );

    return res.status(201).json({ message: 'Driver added successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET ALL DRIVERS
 */
exports.getDrivers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM drivers');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE DRIVER STATUS
 */
exports.updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE drivers SET status = ? WHERE id = ?',
      [status, id]
    );

    return res.status(200).json({ message: 'Driver status updated' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};