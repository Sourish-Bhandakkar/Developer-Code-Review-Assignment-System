import pool from '../config/db.js';
import { findBestReviewers, calculateDeveloperScore } from '../services/assignmentService.js';

// Helper to fetch developers in format expected by assignment engine
async function getDevelopersForEngine(client) {
  const query = `
    SELECT 
      d.id,
      d.user_id,
      u.name,
      u.email,
      u.status,
      d.experience_years,
      d.availability,
      d.max_workload,
      d.current_workload,
      e.name as expertise_name,
      de.skill_level
    FROM developers d
    JOIN users u ON d.user_id = u.id
    LEFT JOIN developer_expertise de ON d.id = de.developer_id
    LEFT JOIN expertise e ON de.expertise_id = e.id
  `;
  const result = await client.query(query);
  
  // Group expertises in JavaScript
  const devMap = new Map();
  result.rows.forEach(row => {
    if (!devMap.has(row.id)) {
      devMap.set(row.id, {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        email: row.email,
        status: row.status,
        experience_years: row.experience_years,
        availability: row.availability,
        max_workload: row.max_workload,
        current_workload: row.current_workload,
        expertises: []
      });
    }
    if (row.expertise_name) {
      devMap.get(row.id).expertises.push({
        name: row.expertise_name,
        skill_level: row.skill_level
      });
    }
  });

  return Array.from(devMap.values());
}

export async function createReviewRequest(req, res) {
  const { repository_name, pull_request_id, title, description, language, technologies, priority, complexity, deadline } = req.body;

  if (!repository_name || !pull_request_id || !title || !language || !technologies || !Array.isArray(technologies) || technologies.length === 0 || !priority || !complexity || !deadline) {
    return res.status(400).json({ message: 'All review fields and at least one technology must be supplied.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Save review request
    const reviewRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9)
       RETURNING *`,
      [repository_name, pull_request_id, title, description, language, priority, complexity, deadline, req.user.id]
    );
    const review = reviewRes.rows[0];

    // 2. Insert technologies
    for (const tech of technologies) {
      await client.query(
        'INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)',
        [review.id, tech.trim()]
      );
    }
    review.technologies = technologies;

    // 3. Fetch developers and run assignment engine
    const developers = await getDevelopersForEngine(client);
    const assignmentResult = findBestReviewers(developers, review);

    let assignedDeveloper = null;
    let scoreDetails = null;

    if (assignmentResult.eligible.length > 0) {
      // Get the highest scoring developer
      const best = assignmentResult.eligible[0];
      assignedDeveloper = best.developer;
      scoreDetails = best;

      // Create assignment
      await client.query(
        `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Assigned')`,
        [
          review.id,
          assignedDeveloper.id,
          best.finalScore,
          best.expertiseScore,
          best.availabilityScore,
          best.workloadScore,
          best.experienceScore,
          best.priorityScore
        ]
      );

      // Increment developer's workload
      await client.query(
        'UPDATE developers SET current_workload = current_workload + 1 WHERE id = $1',
        [assignedDeveloper.id]
      );

      // Update review status to 'Assigned'
      await client.query(
        "UPDATE review_requests SET status = 'Assigned' WHERE id = $1",
        [review.id]
      );
      review.status = 'Assigned';

      // Log to history
      await client.query(
        `INSERT INTO assignment_history (review_id, developer_id, score, action)
         VALUES ($1, $2, $3, 'Assign')`,
        [review.id, assignedDeveloper.id, best.finalScore]
      );
    }

    await client.query('COMMIT');
    
    return res.status(201).json({
      message: assignedDeveloper 
        ? `Review request created and assigned automatically to ${assignedDeveloper.name}.`
        : 'Review request created. No available developer satisfies the expertise and workload requirements.',
      review,
      assignment: scoreDetails ? {
        developer: assignedDeveloper,
        score: scoreDetails.finalScore,
        breakdown: {
          expertise: scoreDetails.expertiseScore,
          availability: scoreDetails.availabilityScore,
          workload: scoreDetails.workloadScore,
          experience: scoreDetails.experienceScore,
          priority: scoreDetails.priorityScore
        }
      } : null,
      engineResults: {
        eligibleCount: assignmentResult.eligible.length,
        excludedCount: assignmentResult.excluded.length,
        excludedList: assignmentResult.excluded
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating review request:', error);
    return res.status(500).json({ message: 'Internal server error saving review request.' });
  } finally {
    client.release();
  }
}

export async function getAllReviews(req, res) {
  try {
    const { developerId, status, priority } = req.query;
    
    let query = `
      SELECT 
        r.id, r.repository_name, r.pull_request_id, r.title, r.description, 
        r.language, r.priority, r.complexity, r.deadline, r.status, r.created_at,
        u_creator.name as creator_name,
        rt.technology,
        a.developer_id as assigned_developer_id,
        u_dev.name as assigned_developer_name,
        a.score as assignment_score
      FROM review_requests r
      JOIN users u_creator ON r.created_by = u_creator.id
      LEFT JOIN review_technologies rt ON r.id = rt.review_id
      LEFT JOIN assignments a ON r.id = a.review_id
      LEFT JOIN developers d ON a.developer_id = d.id
      LEFT JOIN users u_dev ON d.user_id = u_dev.id
      WHERE 1=1
    `;
    const params = [];

    if (developerId) {
      params.push(developerId);
      query += ` AND a.developer_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    if (priority) {
      params.push(priority);
      query += ` AND r.priority = $${params.length}`;
    }

    const result = await pool.query(query, params);
    
    // Group technologies in JavaScript
    const reviewsMap = new Map();
    result.rows.forEach(row => {
      if (!reviewsMap.has(row.id)) {
        reviewsMap.set(row.id, {
          id: row.id,
          repository_name: row.repository_name,
          pull_request_id: row.pull_request_id,
          title: row.title,
          description: row.description,
          language: row.language,
          priority: row.priority,
          complexity: row.complexity,
          deadline: row.deadline,
          status: row.status,
          created_at: row.created_at,
          creator_name: row.creator_name,
          technologies: [],
          assigned_developer_id: row.assigned_developer_id,
          assigned_developer_name: row.assigned_developer_name,
          assignment_score: row.assignment_score
        });
      }
      if (row.technology) {
        const rev = reviewsMap.get(row.id);
        if (!rev.technologies.includes(row.technology)) {
          rev.technologies.push(row.technology);
        }
      }
    });

    const reviews = Array.from(reviewsMap.values());
    // Sort by created_at DESC
    reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Internal server error fetching reviews.' });
  }
}

export async function getReviewById(req, res) {
  const { id } = req.params;
  try {
    // 1. Fetch Review Request Details and Technologies
    const reviewQuery = `
      SELECT 
        r.*,
        u_creator.name as creator_name,
        rt.technology
      FROM review_requests r
      JOIN users u_creator ON r.created_by = u_creator.id
      LEFT JOIN review_technologies rt ON r.id = rt.review_id
      WHERE r.id = $1
    `;
    const reviewRes = await pool.query(reviewQuery, [id]);
    if (reviewRes.rows.length === 0) {
      return res.status(404).json({ message: 'Review request not found.' });
    }
    
    const firstRow = reviewRes.rows[0];
    const review = {
      id: firstRow.id,
      repository_name: firstRow.repository_name,
      pull_request_id: firstRow.pull_request_id,
      title: firstRow.title,
      description: firstRow.description,
      language: firstRow.language,
      priority: firstRow.priority,
      complexity: firstRow.complexity,
      deadline: firstRow.deadline,
      status: firstRow.status,
      created_by: firstRow.created_by,
      created_at: firstRow.created_at,
      creator_name: firstRow.creator_name,
      technologies: []
    };

    reviewRes.rows.forEach(row => {
      if (row.technology && !review.technologies.includes(row.technology)) {
        review.technologies.push(row.technology);
      }
    });

    // 2. Fetch Active Assignment Breakdown
    const assignmentQuery = `
      SELECT 
        a.id as assignment_id, a.developer_id, a.score, 
        a.expertise_score, a.availability_score, a.workload_score, a.experience_score, a.priority_score,
        a.assigned_at, a.status as assignment_status,
        u_dev.name as developer_name, u_dev.email as developer_email,
        d.experience_years, d.availability, d.current_workload, d.max_workload
      FROM assignments a
      JOIN developers d ON a.developer_id = d.id
      JOIN users u_dev ON d.user_id = u_dev.id
      WHERE a.review_id = $1
    `;
    const assignRes = await pool.query(assignmentQuery, [id]);
    const assignment = assignRes.rows.length > 0 ? assignRes.rows[0] : null;

    // 3. Fetch Assignment History
    const historyQuery = `
      SELECT 
        h.id, h.score, h.action, h.timestamp,
        u_dev.name as developer_name
      FROM assignment_history h
      JOIN developers d ON h.developer_id = d.id
      JOIN users u_dev ON d.user_id = u_dev.id
      WHERE h.review_id = $1
      ORDER BY h.timestamp DESC
    `;
    const historyRes = await pool.query(historyQuery, [id]);

    return res.json({
      review,
      assignment,
      history: historyRes.rows
    });
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return res.status(500).json({ message: 'Internal server error fetching review details.' });
  }
}

export async function getEligibleReviewersForReview(req, res) {
  const { id } = req.params; // review_id
  try {
    // 1. Fetch Review Request Details
    const reviewQuery = `
      SELECT 
        r.id, r.priority, r.complexity,
        rt.technology
      FROM review_requests r
      LEFT JOIN review_technologies rt ON r.id = rt.review_id
      WHERE r.id = $1
    `;
    const reviewRes = await pool.query(reviewQuery, [id]);
    if (reviewRes.rows.length === 0) {
      return res.status(404).json({ message: 'Review request not found.' });
    }
    
    const firstRow = reviewRes.rows[0];
    const review = {
      id: firstRow.id,
      priority: firstRow.priority,
      complexity: firstRow.complexity,
      technologies: []
    };

    reviewRes.rows.forEach(row => {
      if (row.technology && !review.technologies.includes(row.technology)) {
        review.technologies.push(row.technology);
      }
    });

    // 2. Fetch all active developers
    const devs = await getDevelopersForEngine(pool);

    // 3. Compute scores using the Engine
    const result = findBestReviewers(devs, review);
    return res.json(result);
  } catch (error) {
    console.error('Error fetching eligible reviewers:', error);
    return res.status(500).json({ message: 'Internal server error calculating potential reviewers.' });
  }
}

export async function autoAssignReview(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check if review request exists and is Pending
    const reviewQuery = `
      SELECT 
        r.*,
        rt.technology
      FROM review_requests r
      LEFT JOIN review_technologies rt ON r.id = rt.review_id
      WHERE r.id = $1
    `;
    const reviewRes = await client.query(reviewQuery, [id]);
    if (reviewRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Review request not found.' });
    }
    
    const firstRow = reviewRes.rows[0];
    const review = {
      id: firstRow.id,
      priority: firstRow.priority,
      complexity: firstRow.complexity,
      status: firstRow.status,
      technologies: []
    };

    reviewRes.rows.forEach(row => {
      if (row.technology && !review.technologies.includes(row.technology)) {
        review.technologies.push(row.technology);
      }
    });

    if (review.status !== 'Pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Review request is already assigned or completed.' });
    }

    // 2. Run engine
    const developers = await getDevelopersForEngine(client);
    const assignmentResult = findBestReviewers(developers, review);

    if (assignmentResult.eligible.length === 0) {
      await client.query('ROLLBACK');
      return res.status(422).json({
        message: 'No suitable reviewer currently available.',
        engineResults: assignmentResult
      });
    }

    const best = assignmentResult.eligible[0];
    const dev = best.developer;

    // Create Assignment
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Assigned')`,
      [review.id, dev.id, best.finalScore, best.expertiseScore, best.availabilityScore, best.workloadScore, best.experienceScore, best.priorityScore]
    );

    // Update workload
    await client.query('UPDATE developers SET current_workload = current_workload + 1 WHERE id = $1', [dev.id]);

    // Update review request status
    await client.query("UPDATE review_requests SET status = 'Assigned' WHERE id = $1", [review.id]);

    // Add to history
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, 'Assign')`,
      [review.id, dev.id, best.finalScore]
    );

    await client.query('COMMIT');
    return res.json({
      message: `Successfully assigned review request to ${dev.name}`,
      developer: dev,
      score: best.finalScore
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error auto-assigning review:', error);
    return res.status(500).json({ message: 'Internal server error during assignment.' });
  } finally {
    client.release();
  }
}

export async function reassignReview(req, res) {
  const { id } = req.params; // review_id
  const { developer_id } = req.body; // new developer_id

  if (!developer_id) {
    return res.status(400).json({ message: 'Developer ID is required for reassignment.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get review request
    const reviewRes = await client.query('SELECT status, priority, complexity FROM review_requests WHERE id = $1', [id]);
    if (reviewRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Review request not found.' });
    }
    const review = reviewRes.rows[0];

    if (review.status === 'Completed') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot reassign a completed review.' });
    }

    // 2. Fetch technologies
    const techRes = await client.query('SELECT technology FROM review_technologies WHERE review_id = $1', [id]);
    review.technologies = techRes.rows.map(r => r.technology);

    // 3. Fetch developer details to verify existence
    const devQuery = `
      SELECT 
        d.id, d.experience_years, d.availability, d.max_workload, d.current_workload,
        u.name, u.email, u.status,
        e.name as expertise_name, de.skill_level
      FROM developers d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN developer_expertise de ON d.id = de.developer_id
      LEFT JOIN expertise e ON de.expertise_id = e.id
      WHERE d.id = $1
    `;
    const devRes = await client.query(devQuery, [developer_id]);
    if (devRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Developer not found.' });
    }
    
    const firstRow = devRes.rows[0];
    const developer = {
      id: firstRow.id,
      experience_years: firstRow.experience_years,
      availability: firstRow.availability,
      max_workload: firstRow.max_workload,
      current_workload: firstRow.current_workload,
      name: firstRow.name,
      email: firstRow.email,
      status: firstRow.status,
      expertises: []
    };

    devRes.rows.forEach(row => {
      if (row.expertise_name) {
        developer.expertises.push({
          name: row.expertise_name,
          skill_level: row.skill_level
        });
      }
    });

    if (developer.status !== 'Active') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot assign to an inactive developer.' });
    }

    // 4. Check current active assignment
    const assignCheck = await client.query('SELECT developer_id, id FROM assignments WHERE review_id = $1', [id]);
    let originalDevId = null;

    if (assignCheck.rows.length > 0) {
      originalDevId = assignCheck.rows[0].developer_id;
      if (originalDevId === developer_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Developer is already assigned to this review.' });
      }

      // Decrement workload of original developer
      await client.query(
        'UPDATE developers SET current_workload = CASE WHEN current_workload > 0 THEN current_workload - 1 ELSE 0 END WHERE id = $1',
        [originalDevId]
      );

      // Remove existing assignment
      await client.query('DELETE FROM assignments WHERE id = $1', [assignCheck.rows[0].id]);
    }

    // 5. Calculate scores for the new developer
    const scores = calculateDeveloperScore(developer, review);

    // 6. Create new assignment
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Assigned')`,
      [id, developer_id, scores.finalScore, scores.expertiseScore, scores.availabilityScore, scores.workloadScore, scores.experienceScore, scores.priorityScore]
    );

    // 7. Increment workload of new developer (can exceed max_workload on override, per requirement)
    await client.query(
      'UPDATE developers SET current_workload = current_workload + 1 WHERE id = $1',
      [developer_id]
    );

    // 8. Update review status
    await client.query("UPDATE review_requests SET status = 'Assigned' WHERE id = $1", [id]);

    // 9. Write to history
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, 'Reassign')`,
      [id, developer_id, scores.finalScore]
    );

    await client.query('COMMIT');
    return res.json({
      message: `Review successfully reassigned to ${developer.name}.`,
      developer_name: developer.name,
      score: scores.finalScore
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error reassigning review:', error);
    return res.status(500).json({ message: 'Internal server error during reassignment.' });
  } finally {
    client.release();
  }
}

export async function updateReviewStatus(req, res) {
  const { id } = req.params; // review_id
  const { status } = req.body; // 'Pending' | 'Assigned' | 'In Progress' | 'Completed'

  if (!status || !['Pending', 'Assigned', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid review status.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get current review status and developer assignment
    const reviewQuery = `
      SELECT r.status, a.developer_id, a.score
      FROM review_requests r
      LEFT JOIN assignments a ON r.id = a.review_id
      WHERE r.id = $1
    `;
    const reviewRes = await client.query(reviewQuery, [id]);
    if (reviewRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Review request not found.' });
    }
    const review = reviewRes.rows[0];

    if (review.status === status) {
      await client.query('ROLLBACK');
      return res.json({ message: `Review request is already in status '${status}'.` });
    }

    // Role verification (Only admin or the assigned developer can modify status)
    if (req.user.role === 'Developer') {
      const devRes = await client.query('SELECT id FROM developers WHERE user_id = $1', [req.user.id]);
      if (devRes.rows.length === 0 || devRes.rows[0].id !== review.developer_id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ message: 'Access denied. You can only update reviews assigned to you.' });
      }
    }

    // Perform updates
    await client.query('UPDATE review_requests SET status = $1 WHERE id = $2', [status, id]);

    if (review.developer_id) {
      // Sync assignment status
      let assignStatus = 'Assigned';
      if (status === 'In Progress') assignStatus = 'In Progress';
      if (status === 'Completed') assignStatus = 'Completed';
      
      await client.query('UPDATE assignments SET status = $1 WHERE review_id = $2', [assignStatus, id]);

      // If status changes to Completed, decrement workload
      if (status === 'Completed' && review.status !== 'Completed') {
        await client.query(
          'UPDATE developers SET current_workload = CASE WHEN current_workload > 0 THEN current_workload - 1 ELSE 0 END WHERE id = $1',
          [review.developer_id]
        );
        // Log Complete to history
        await client.query(
          `INSERT INTO assignment_history (review_id, developer_id, score, action)
           VALUES ($1, $2, $3, 'Complete')`,
          [id, review.developer_id, review.score || 100]
        );
      } else if (status === 'In Progress' && review.status === 'Assigned') {
        // Log In Progress to history
        await client.query(
          `INSERT INTO assignment_history (review_id, developer_id, score, action)
           VALUES ($1, $2, $3, 'In Progress')`,
          [id, review.developer_id, review.score || 100]
        );
      }
    }

    await client.query('COMMIT');
    return res.json({ message: `Review status updated to ${status}.` });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating review status:', error);
    return res.status(500).json({ message: 'Internal server error updating review status.' });
  } finally {
    client.release();
  }
}

export async function getSystemStats(req, res) {
  try {
    // 1. Basic counts
    const devCounts = await pool.query(`
      SELECT 
        COUNT(id) as total_devs,
        SUM(CASE WHEN availability = 'Available' THEN 1 ELSE 0 END) as available_devs,
        SUM(CASE WHEN availability = 'Busy' THEN 1 ELSE 0 END) as busy_devs,
        SUM(CASE WHEN availability = 'Unavailable' THEN 1 ELSE 0 END) as unavailable_devs
      FROM developers
      WHERE user_id IN (SELECT id FROM users WHERE status = 'Active')
    `);

    const reviewCounts = await pool.query(`
      SELECT 
        COUNT(id) as total_reviews,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_reviews,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) as assigned_reviews,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_reviews,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_reviews,
        SUM(CASE WHEN priority = 'High' OR priority = 'Critical' THEN 1 ELSE 0 END) as urgent_reviews
      FROM review_requests
    `);

    // 2. Average score of active/completed assignments
    const avgScoreRes = await pool.query('SELECT ROUND(AVG(score)) as avg_score FROM assignments');

    // 3. Workload distribution for charting
    const workloadDist = await pool.query(`
      SELECT 
        u.name,
        d.current_workload,
        d.max_workload
      FROM developers d
      JOIN users u ON d.user_id = u.id
      WHERE u.status = 'Active'
      ORDER BY d.current_workload DESC
    `);

    // 4. Distribution of languages
    const langDist = await pool.query(`
      SELECT language, COUNT(id) as count
      FROM review_requests
      GROUP BY language
      ORDER BY count DESC
    `);

    return res.json({
      developers: devCounts.rows[0],
      reviews: reviewCounts.rows[0],
      averageScore: avgScoreRes.rows[0].avg_score || 0,
      workloadDistribution: workloadDist.rows,
      languageDistribution: langDist.rows
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Internal server error fetching system statistics.' });
  }
}

export async function getAssignmentHistory(req, res) {
  try {
    const historyQuery = `
      SELECT 
        h.id, h.score, h.action, h.timestamp,
        r.id as review_id, r.repository_name, r.pull_request_id, r.title, r.priority, r.complexity,
        u_dev.name as developer_name, u_dev.email as developer_email
      FROM assignment_history h
      JOIN review_requests r ON h.review_id = r.id
      JOIN developers d ON h.developer_id = d.id
      JOIN users u_dev ON d.user_id = u_dev.id
      ORDER BY h.timestamp DESC
    `;
    const result = await pool.query(historyQuery);
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ message: 'Internal server error fetching assignment history.' });
  }
}
