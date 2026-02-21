const pool = require('../config/db');

/**
 * GET ALL VEHICLES
 */
exports.getVehicles = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vehicles');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * ADD VEHICLE
 * Schema: name_model, license_plate, max_load_kg, current_odometer, acquisition_cost, status
 */
exports.addVehicle = async (req, res) => {
  try {
    const {
      name_model,
      license_plate,
      max_load_kg,
      current_odometer,
      acquisition_cost
    } = req.body;

    if (!name_model || !license_plate || max_load_kg == null || acquisition_cost == null) {
      return res.status(400).json({ message: 'name_model, license_plate, max_load_kg and acquisition_cost are required' });
    }

    await pool.query(
      `INSERT INTO vehicles 
      (name_model, license_plate, max_load_kg, current_odometer, acquisition_cost)
      VALUES (?, ?, ?, ?, ?)`,
      [
        name_model,
        license_plate,
        max_load_kg,
        current_odometer || 0,
        acquisition_cost
      ]
    );

    return res.status(201).json({ message: 'Vehicle added successfully' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE VEHICLE STATUS
 */
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      [status, id]
    );

    return res.status(200).json({ message: 'Vehicle status updated' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};