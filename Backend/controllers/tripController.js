const pool = require('../config/db');

/**
 * GET ALL TRIPS
 */
exports.getTrips = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT trips.*, vehicles.name_model, drivers.name
      FROM trips
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
      LEFT JOIN drivers ON trips.driver_id = drivers.id
    `);

    return res.status(200).json(rows);

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * CREATE TRIP
 */
exports.createTrip = async (req, res) => {
  try {
    const { vehicle_id, driver_id, cargo_weight, source, destination } = req.body;

    if (!source || !destination) {
      return res.status(400).json({ message: 'Source and destination are required' });
    }

    const [vehicle] = await pool.query(
      'SELECT * FROM vehicles WHERE id = ?',
      [vehicle_id]
    );

    if (vehicle.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (cargo_weight > vehicle[0].max_load_kg) {
      return res.status(400).json({ message: 'Cargo exceeds vehicle capacity' });
    }

    await pool.query(
      `INSERT INTO trips (vehicle_id, driver_id, cargo_weight, source, destination, status)
       VALUES (?, ?, ?, ?, ?, 'Dispatched')`,
      [vehicle_id, driver_id, cargo_weight, source, destination]
    );

    await pool.query(
      "UPDATE vehicles SET status = 'On Trip' WHERE id = ?",
      [vehicle_id]
    );

    await pool.query(
      "UPDATE drivers SET status = 'On Duty' WHERE id = ?",
      [driver_id]
    );

    return res.status(201).json({ message: 'Trip created successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * COMPLETE TRIP
 */
exports.completeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { end_odometer, revenue } = req.body;

    const [trip] = await pool.query(
      'SELECT * FROM trips WHERE id = ?',
      [id]
    );

    if (trip.length === 0) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const vehicleId = trip[0].vehicle_id;
    const driverId = trip[0].driver_id;

    await pool.query(
      `UPDATE trips 
       SET status = 'Completed', end_odometer = ?, revenue = ?
       WHERE id = ?`,
      [end_odometer, revenue || 0, id]
    );

    await pool.query(
      "UPDATE vehicles SET status = 'Available', current_odometer = ? WHERE id = ?",
      [end_odometer, vehicleId]
    );

    await pool.query(
      "UPDATE drivers SET status = 'On Duty' WHERE id = ?",
      [driverId]
    );

    return res.status(200).json({ message: 'Trip completed successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};