import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'development_key_1234567890';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields (name, email, password) are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user already exists
    const userExistRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExistRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create User (always default to 'Developer' role per requirements)
    const userInsertRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, status`,
      [name, email, passwordHash, 'Developer', 'Active']
    );
    const newUser = userInsertRes.rows[0];

    // Create corresponding Developer profile with defaults
    await client.query(
      `INSERT INTO developers (user_id, experience_years, availability, max_workload, current_workload)
       VALUES ($1, 0, 'Available', 3, 0)`,
      [newUser.id]
    );

    await client.query('COMMIT');

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    // Find user
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];

    // Verify status
    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Your account is deactivated. Please contact an admin.' });
    }

    // Compare password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
}

export async function getMe(req, res) {
  try {
    const userRes = await pool.query(
      `SELECT id, name, email, role, status FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = userRes.rows[0];

    // If developer, get developer stats/profile too
    let devProfile = null;
    if (user.role === 'Developer') {
      const devRes = await pool.query(
        `SELECT d.id as developer_id, d.experience_years, d.availability, d.max_workload, d.current_workload
         FROM developers d WHERE d.user_id = $1`,
        [user.id]
      );
      if (devRes.rows.length > 0) {
        devProfile = devRes.rows[0];

        // Fetch developer expertise
        const expRes = await pool.query(
          `SELECT e.name, de.skill_level 
           FROM developer_expertise de
           JOIN expertise e ON de.expertise_id = e.id
           WHERE de.developer_id = $1`,
          [devProfile.developer_id]
        );
        devProfile.expertises = expRes.rows;
      }
    }

    return res.json({
      user,
      developerProfile: devProfile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Internal server error fetching profile.' });
  }
}
