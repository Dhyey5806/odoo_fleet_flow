const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const capitalizeRole = (role) => {
  if (!role) return role;
  const r = String(role).toLowerCase();
  if (r === 'admin') return 'Admin';
  if (r === 'manager') return 'Manager';
  if (r === 'dispatcher') return 'Dispatcher';
  if (r === 'driver') return 'Driver';
  return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ');
};

/**
 * REGISTER USER
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, role: rawRole } = req.body;
    const role = capitalizeRole(rawRole) || rawRole;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['Admin', 'Manager', 'Dispatcher', 'Driver'].includes(role)) {
      return res.status(400).json({ message: 'Role must be Admin, Manager, Dispatcher or Driver' });
    }

    // Check if user already exists
    const [existingUser] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const [insertResult] = await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );

    const userId = insertResult.insertId;
    const token = jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, email, role }
    });

  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * LOGIN USER
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role: rawRole } = req.body;
    const role = capitalizeRole(rawRole) || rawRole;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by email and role
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};