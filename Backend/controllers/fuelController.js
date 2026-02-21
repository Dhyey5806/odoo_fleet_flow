const pool = require('../config/db');

exports.addFuelLog = async (req, res) => {
  try {
    const { vehicle_id, trip_id, liters, cost, date } = req.body;

    await pool.query(
      `INSERT INTO fuel_logs (vehicle_id, trip_id, liters, cost, date)
       VALUES (?, ?, ?, ?, ?)`,
      [vehicle_id, trip_id, liters, cost, date]
    );

    return res.status(201).json({ message: 'Fuel log added successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};