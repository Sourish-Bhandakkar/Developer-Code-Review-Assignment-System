import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// Helper to update a developer's expertise list in a transaction
async function setDeveloperExpertise(client, developerId, expertisesList) {
  // 1. Clear existing expertises
  await client.query('DELETE FROM developer_expertise WHERE developer_id = $1', [developerId]);
  
  if (!expertisesList || !Array.isArray(expertisesList) || expertisesList.length === 0) {
    return;
  }

  for (const exp of expertisesList) {
    // Check if expertise tag exists in global list, create if not
    let expRes = await client.query('SELECT id FROM expertise WHERE LOWER(name) = LOWER($1)', [exp.name.trim()]);
    let expId;
    
    if (expRes.rows.length === 0) {
      const insertExp = await client.query(
        'INSERT INTO expertise (name) VALUES ($1) RETURNING id',
        [exp.name.trim()]
      );
      expId = insertExp.rows[0].id;
    } else {
      expId = expRes.rows[0].id;
    }

    // Insert developer expertise
    await client.query(
      `INSERT INTO developer_expertise (developer_id, expertise_id, skill_level)
       VALUES ($1, $2, $3)`,
      [developerId, expId, exp.skill_level || 2]
    );
  }
}

export async function getAllDevelopers(req, res) {
  try {
    const query = `
      SELECT 
        d.id as developer_id,
        d.user_id,
        u.name,
        u.email,
        u.role,
        u.status,
        d.experience_years,
        d.availability,
        d.max_workload,
        d.current_workload,
        d.created_at,
        e.name as expertise_name,
        de.skill_level
      FROM developers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN developer_expertise de ON d.id = de.developer_id
      LEFT JOIN expertise e ON de.expertise_id = e.id
      ORDER BY u.name ASC
    `;
    const result = await pool.query(query);
    
    // Group expertises in JavaScript
    const devMap = new Map();
    result.rows.forEach(row => {
      if (!devMap.has(row.developer_id)) {
        devMap.set(row.developer_id, {
          developer_id: row.developer_id,
          user_id: row.user_id,
          name: row.name,
          email: row.email,
          role: row.role,
          status: row.status,
          experience_years: row.experience_years,
          availability: row.availability,
          max_workload: row.max_workload,
          current_workload: row.current_workload,
          created_at: row.created_at,
          expertises: []
        });
      }
      if (row.expertise_name) {
        devMap.get(row.developer_id).expertises.push({
          name: row.expertise_name,
          skill_level: row.skill_level
        });
      }
    });

    return res.json(Array.from(devMap.values()));
  } catch (error) {
    console.error('Error fetching developers:', error);
    return res.status(500).json({ message: 'Internal server error fetching developers.' });
  }
}

export async function getDeveloperById(req, res) {
  const { id } = req.params; // developer_id
  try {
    const query = `
      SELECT 
        d.id as developer_id,
        d.user_id,
        u.name,
        u.email,
        u.role,
        u.status,
        d.experience_years,
        d.availability,
        d.max_workload,
        d.current_workload,
        d.created_at,
        e.name as expertise_name,
        de.skill_level
      FROM developers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN developer_expertise de ON d.id = de.developer_id
      LEFT JOIN expertise e ON de.expertise_id = e.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Developer not found.' });
    }

    const firstRow = result.rows[0];
    const dev = {
      developer_id: firstRow.developer_id,
      user_id: firstRow.user_id,
      name: firstRow.name,
      email: firstRow.email,
      role: firstRow.role,
      status: firstRow.status,
      experience_years: firstRow.experience_years,
      availability: firstRow.availability,
      max_workload: firstRow.max_workload,
      current_workload: firstRow.current_workload,
      created_at: firstRow.created_at,
      expertises: []
    };

    result.rows.forEach(row => {
      if (row.expertise_name) {
        dev.expertises.push({
          name: row.expertise_name,
          skill_level: row.skill_level
        });
      }
    });

    return res.json(dev);
  } catch (error) {
    console.error('Error fetching developer:', error);
    return res.status(500).json({ message: 'Internal server error fetching developer.' });
  }
}

export async function createDeveloper(req, res) {
  const { name, email, password, experience_years, availability, max_workload, expertises } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already exists
    const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Email already exists.' });
    }

    // Insert user
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, 'Developer', 'Active')
       RETURNING id`,
      [name, email, passwordHash]
    );
    const userId = userRes.rows[0].id;

    // Insert developer profile
    const devRes = await client.query(
      `INSERT INTO developers (user_id, experience_years, availability, max_workload, current_workload)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING id`,
      [
        userId,
        parseInt(experience_years) || 0,
        availability || 'Available',
        parseInt(max_workload) || 3
      ]
    );
    const developerId = devRes.rows[0].id;

    // Insert developer expertise mapping
    await setDeveloperExpertise(client, developerId, expertises);

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Developer created successfully.', developerId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating developer:', error);
    return res.status(500).json({ message: 'Internal server error creating developer.' });
  } finally {
    client.release();
  }
}

export async function updateDeveloper(req, res) {
  const { id } = req.params; // developer_id
  const { name, email, password, experience_years, availability, max_workload, status, expertises } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get developer profile and user_id
    const devCheck = await client.query('SELECT user_id FROM developers WHERE id = $1', [id]);
    if (devCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Developer not found.' });
    }
    const userId = devCheck.rows[0].user_id;

    // 2. Update user name/email/status/password
    if (email) {
      const emailCheck = await client.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (emailCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Email already exists.' });
      }
    }

    let updateUserSql = 'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), status = COALESCE($3, status)';
    const userParams = [name, email, status];

    if (password && password.trim() !== '') {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      updateUserSql += ', password_hash = $4 WHERE id = $5';
      userParams.push(passwordHash, userId);
    } else {
      updateUserSql += ' WHERE id = $4';
      userParams.push(userId);
    }
    await client.query(updateUserSql, userParams);

    // 3. Update developer profile
    const updateDevSql = `
      UPDATE developers 
      SET 
        experience_years = COALESCE($1, experience_years), 
        availability = COALESCE($2, availability), 
        max_workload = COALESCE($3, max_workload)
      WHERE id = $4
    `;
    await client.query(updateDevSql, [
      experience_years !== undefined ? parseInt(experience_years) : null,
      availability,
      max_workload !== undefined ? parseInt(max_workload) : null,
      id
    ]);

    // 4. Update expertises
    if (expertises) {
      await setDeveloperExpertise(client, id, expertises);
    }

    await client.query('COMMIT');
    return res.json({ message: 'Developer updated successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating developer:', error);
    return res.status(500).json({ message: 'Internal server error updating developer.' });
  } finally {
    client.release();
  }
}

export async function updateAvailability(req, res) {
  const { id } = req.params; // developer_id
  const { availability } = req.body;

  if (!availability || !['Available', 'Busy', 'Unavailable'].includes(availability)) {
    return res.status(400).json({ message: 'Invalid availability status.' });
  }

  try {
    const result = await pool.query(
      'UPDATE developers SET availability = $1 WHERE id = $2 RETURNING id',
      [availability, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Developer not found.' });
    }

    return res.json({ message: 'Availability updated successfully.' });
  } catch (error) {
    console.error('Error updating availability:', error);
    return res.status(500).json({ message: 'Internal server error updating availability.' });
  }
}

export async function deleteDeveloper(req, res) {
  const { id } = req.params; // developer_id
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user_id first
    const devRes = await client.query('SELECT user_id FROM developers WHERE id = $1', [id]);
    if (devRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Developer not found.' });
    }
    const userId = devRes.rows[0].user_id;

    // Delete user (cascades to developer table)
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
    return res.json({ message: 'Developer deleted successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting developer:', error);
    return res.status(500).json({ message: 'Internal server error deleting developer.' });
  } finally {
    client.release();
  }
}

export async function getExpertiseOptions(req, res) {
  try {
    const result = await pool.query('SELECT id, name FROM expertise ORDER BY name ASC');
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expertise options:', error);
    return res.status(500).json({ message: 'Internal server error fetching expertise options.' });
  }
}
