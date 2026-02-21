const pool = require('../config/db');

/**
 * GET /api/analytics
 * Returns vehicles ROI + tripStats (totalDistance, fuelEfficiency, avgTripDistance, etc.)
 */
exports.getVehicleAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.id,
        v.name_model,
        v.acquisition_cost,
        IFNULL(SUM(f.cost), 0) AS total_fuel_cost,
        IFNULL(SUM(s.cost), 0) AS total_maintenance_cost,
        IFNULL(SUM(t.revenue), 0) AS total_revenue
      FROM vehicles v
      LEFT JOIN fuel_logs f ON v.id = f.vehicle_id
      LEFT JOIN service_logs s ON v.id = s.vehicle_id
      LEFT JOIN trips t ON v.id = t.vehicle_id
      GROUP BY v.id
    `);

    const vehicles = rows.map(vehicle => {
      const totalOperationalCost =
        vehicle.total_fuel_cost + vehicle.total_maintenance_cost;

      const roi =
        vehicle.acquisition_cost === 0
          ? 0
          : (
              (vehicle.total_revenue - totalOperationalCost) /
              vehicle.acquisition_cost
            ).toFixed(2);

      return {
        ...vehicle,
        totalOperationalCost,
        roi
      };
    });

    // Trip stats: total distance (from completed trips), total fuel liters, efficiency, avg trip distance
    const [distanceRow] = await pool.query(`
      SELECT 
        COUNT(*) AS completed_trip_count,
        COALESCE(SUM(GREATEST(COALESCE(end_odometer, 0) - COALESCE(start_odometer, 0), 0)), 0) AS total_distance
      FROM trips
      WHERE status = 'Completed'
    `);
    const [fuelRow] = await pool.query(`
      SELECT COALESCE(SUM(liters), 0) AS total_liters FROM fuel_logs
    `);

    const completedTripCount = Number(distanceRow[0].completed_trip_count) || 0;
    const totalDistance = Number(distanceRow[0].total_distance) || 0;
    const totalFuelLiters = Number(fuelRow[0].total_liters) || 0;
    const fuelEfficiency = totalFuelLiters > 0 ? (totalDistance / totalFuelLiters).toFixed(2) : 0;
    const avgTripDistance = completedTripCount > 0 ? (totalDistance / completedTripCount).toFixed(0) : 0;

    return res.status(200).json({
      vehicles,
      tripStats: {
        totalDistance,
        totalFuelLiters,
        fuelEfficiency: Number(fuelEfficiency),
        completedTripCount,
        avgTripDistance: Number(avgTripDistance)
      }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};