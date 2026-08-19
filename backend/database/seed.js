import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeeder() {
  console.log('Starting database seeding...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Run Schema SQL based on database type
    const schemaFile = pool.dbType === 'postgres' ? 'schema.sql' : 'schema_sqlite.sql';
    const schemaSqlPath = path.join(__dirname, schemaFile);
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log(`Schema tables created successfully using ${schemaFile}.`);

    // 2. Hash Passwords
    const developerPasswordHash = bcrypt.hashSync('password123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    // 3. Insert Admin User (Sourish Bhandakkar)
    const adminRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      ['Sourish Bhandakkar', 'admin@company.com', adminPasswordHash, 'Admin', 'Active']
    );
    const adminId = adminRes.rows[0].id;
    console.log('Admin user inserted.');

    // 4. Insert Expertise categories
    const expertiseList = [
      'Java', 'Spring Boot', 'PostgreSQL', 'REST API',
      'JavaScript', 'React', 'Node.js', 'Express',
      'Python', 'Django', 'Flask', 'Machine Learning',
      'C++', 'Data Structures', 'Algorithms', 'Competitive Programming',
      'SQL', 'MongoDB', 'Database Design',
      'AWS', 'Docker', 'Kubernetes', 'CI/CD',
      'Cybersecurity', 'Network Security', 'Linux',
      'Android', 'Kotlin', 'Firebase'
    ];
    const expertiseMap = {};
    for (const name of expertiseList) {
      const res = await client.query(
        'INSERT INTO expertise (name) VALUES ($1) RETURNING id',
        [name]
      );
      expertiseMap[name] = res.rows[0].id;
    }
    console.log('Expertise categories inserted.');

    // 5. Insert Developer Users & Profiles
    const developersData = [
      {
        name: 'Developer 1',
        email: 'developer1@company.com',
        role: 'Developer',
        experience: 4,
        availability: 'Available',
        maxWorkload: 4,
        currentWorkload: 1, // Will have 1 active review (Review 1)
        expertise: [
          { name: 'Java', level: 3 },
          { name: 'Spring Boot', level: 3 },
          { name: 'PostgreSQL', level: 3 },
          { name: 'REST API', level: 3 }
        ]
      },
      {
        name: 'Developer 2',
        email: 'developer2@company.com',
        role: 'Developer',
        experience: 3,
        availability: 'Available',
        maxWorkload: 3,
        currentWorkload: 0, // Start with 0 (Review 2 will be Pending)
        expertise: [
          { name: 'JavaScript', level: 3 },
          { name: 'React', level: 3 },
          { name: 'Node.js', level: 3 },
          { name: 'Express', level: 3 }
        ]
      },
      {
        name: 'Developer 3',
        email: 'developer3@company.com',
        role: 'Developer',
        experience: 5,
        availability: 'Available',
        maxWorkload: 4,
        currentWorkload: 2, // Will have 2 active reviews
        expertise: [
          { name: 'Python', level: 3 },
          { name: 'Django', level: 3 },
          { name: 'Flask', level: 3 },
          { name: 'Machine Learning', level: 3 }
        ]
      },
      {
        name: 'Developer 4',
        email: 'developer4@company.com',
        role: 'Developer',
        experience: 6,
        availability: 'Busy',
        maxWorkload: 3,
        currentWorkload: 1, // Will have 1 active review
        expertise: [
          { name: 'C++', level: 3 },
          { name: 'Data Structures', level: 3 },
          { name: 'Algorithms', level: 3 },
          { name: 'Competitive Programming', level: 3 }
        ]
      },
      {
        name: 'Developer 5',
        email: 'developer5@company.com',
        role: 'Developer',
        experience: 7,
        availability: 'Available',
        maxWorkload: 4,
        currentWorkload: 2, // Will have 2 active reviews
        expertise: [
          { name: 'SQL', level: 3 },
          { name: 'PostgreSQL', level: 3 },
          { name: 'MongoDB', level: 3 },
          { name: 'Database Design', level: 3 }
        ]
      },
      {
        name: 'Developer 6',
        email: 'developer6@company.com',
        role: 'Developer',
        experience: 5,
        availability: 'Available',
        maxWorkload: 3,
        currentWorkload: 0, // Start with 0 (Review 6 will be Pending)
        expertise: [
          { name: 'AWS', level: 3 },
          { name: 'Docker', level: 3 },
          { name: 'Kubernetes', level: 3 },
          { name: 'CI/CD', level: 3 }
        ]
      },
      {
        name: 'Developer 7',
        email: 'developer7@company.com',
        role: 'Developer',
        experience: 4,
        availability: 'Available',
        maxWorkload: 3,
        currentWorkload: 1, // Will have 1 active review
        expertise: [
          { name: 'Cybersecurity', level: 3 },
          { name: 'Network Security', level: 3 },
          { name: 'Python', level: 2 },
          { name: 'Linux', level: 3 }
        ]
      },
      {
        name: 'Developer 8',
        email: 'developer8@company.com',
        role: 'Developer',
        experience: 3,
        availability: 'Unavailable',
        maxWorkload: 3,
        currentWorkload: 0, // Excluded from routing
        expertise: [
          { name: 'Java', level: 3 },
          { name: 'Android', level: 3 },
          { name: 'Kotlin', level: 3 },
          { name: 'Firebase', level: 3 }
        ]
      }
    ];

    const devIdMap = {}; // mapping dev name to their developer.id
    const devUserIdMap = {}; // mapping dev name to user.id

    for (const dev of developersData) {
      // Create user record
      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [dev.name, dev.email, developerPasswordHash, dev.role, 'Active']
      );
      const userId = userRes.rows[0].id;
      devUserIdMap[dev.name] = userId;

      // Create developer profile
      const devRes = await client.query(
        `INSERT INTO developers (user_id, experience_years, availability, max_workload, current_workload)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [userId, dev.experience, dev.availability, dev.maxWorkload, dev.currentWorkload]
      );
      const devId = devRes.rows[0].id;
      devIdMap[dev.name] = devId;

      // Add expertises
      for (const exp of dev.expertise) {
        const expId = expertiseMap[exp.name];
        if (expId) {
          await client.query(
            `INSERT INTO developer_expertise (developer_id, expertise_id, skill_level)
             VALUES ($1, $2, $3)`,
            [devId, expId, exp.level]
          );
        }
      }
    }
    console.log('Developers and expertise map seeded.');

    // 6. Seed Sample Review Requests

    // Review 1: Payment Gateway API (Assigned to Developer 1)
    const rev1Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Payment Gateway API',
        '#142',
        'Implement Stripe Webhook',
        'Integrate Stripe payment provider and setup webhook listener for payments.',
        'Java',
        'High',
        'Medium',
        '2026-08-20',
        'Assigned',
        adminId
      ]
    );
    const rev1Id = rev1Res.rows[0].id;
    for (const tech of ['Java', 'Spring Boot', 'PostgreSQL']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev1Id, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        rev1Id,
        devIdMap['Developer 1'],
        88, // Score
        100, // Expertise
        100, // Availability
        75,  // Workload (1/4 workload)
        40,  // Experience (4 years)
        90,  // Priority
        'Assigned'
      ]
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev1Id, devIdMap['Developer 1'], 88, 'Assign']
    );

    // Review 2: E-Commerce Frontend (Pending -> Expected Developer 2)
    const rev2Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'E-Commerce Frontend',
        '#56',
        'Add visual catalog grid',
        'Incorporate clean grids and layout wrappers to render responsive shopping items.',
        'JavaScript',
        'Medium',
        'Low',
        '2026-08-25',
        'Pending',
        adminId
      ]
    );
    const rev2Id = rev2Res.rows[0].id;
    for (const tech of ['React', 'JavaScript', 'Node.js']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev2Id, tech]);
    }

    // Review 3: ML Prediction Service (Assigned to Developer 3 - Active Review 1)
    const rev3Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'ML Prediction Service',
        '#88',
        'User preference vector training pipeline',
        'Build user preference vector training pipeline using Python and Scikit.',
        'Python',
        'Medium',
        'High',
        '2026-08-30',
        'Assigned',
        adminId
      ]
    );
    const rev3Id = rev3Res.rows[0].id;
    for (const tech of ['Python', 'Django', 'Machine Learning']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev3Id, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev3Id, devIdMap['Developer 3'], 90, 100, 100, 75, 50, 100, 'Assigned']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev3Id, devIdMap['Developer 3'], 90, 'Assign']
    );

    // Another Review to Developer 3 to satisfy their starting workload of 2:
    const rev3bRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'ML Prediction Service',
        '#89',
        'Tuning recommendations hyperparameters',
        'Optimize model accuracy with updated grid search configurations.',
        'Python',
        'Low',
        'Medium',
        '2026-09-02',
        'In Progress',
        adminId
      ]
    );
    const rev3bId = rev3bRes.rows[0].id;
    for (const tech of ['Python', 'Flask', 'Machine Learning']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev3bId, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev3bId, devIdMap['Developer 3'], 85, 90, 100, 50, 50, 100, 'In Progress']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev3bId, devIdMap['Developer 3'], 85, 'Assign']
    );

    // Review 4: Algorithm Optimization (Pending -> Expected Developer 4)
    const rev4Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Algorithm Optimization',
        '#12',
        'Optimize sorting heuristics',
        'Refactor graph matching library using competitive programming methodologies.',
        'C++',
        'High',
        'High',
        '2026-08-28',
        'Pending',
        adminId
      ]
    );
    const rev4Id = rev4Res.rows[0].id;
    for (const tech of ['C++', 'Data Structures', 'Algorithms']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev4Id, tech]);
    }

    // Seed 1 active review to Developer 4 to satisfy starting workload of 1:
    const rev4bRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Algorithm Optimization',
        '#11',
        'Matrix Multiplication Heuristic',
        'Optimize execution paths for large-scale matrices.',
        'C++',
        'Medium',
        'Medium',
        '2026-09-10',
        'Assigned',
        adminId
      ]
    );
    const rev4bId = rev4bRes.rows[0].id;
    for (const tech of ['C++', 'Competitive Programming']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev4bId, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev4bId, devIdMap['Developer 4'], 72, 80, 50, 66, 60, 100, 'Assigned']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev4bId, devIdMap['Developer 4'], 72, 'Assign']
    );

    // Review 5: Database Optimization (Pending -> Expected Developer 5)
    const rev5Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Database Optimization',
        '#120',
        'Index orders table',
        'Identify slow SELECT queries and create appropriate composite indexes.',
        'SQL',
        'High',
        'High',
        '2026-08-27',
        'Pending',
        adminId
      ]
    );
    const rev5Id = rev5Res.rows[0].id;
    for (const tech of ['SQL', 'PostgreSQL', 'Database Design']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev5Id, tech]);
    }

    // Seed 2 active reviews to Developer 5 to satisfy starting workload of 2:
    const rev5bRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Database Optimization',
        '#118',
        'Setup database scaling configuration',
        'Sharding and replicas configs.',
        'SQL',
        'Medium',
        'Medium',
        '2026-09-12',
        'Assigned',
        adminId
      ]
    );
    const rev5bId = rev5bRes.rows[0].id;
    for (const tech of ['SQL', 'Database Design']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev5bId, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev5bId, devIdMap['Developer 5'], 80, 90, 100, 75, 70, 100, 'Assigned']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev5bId, devIdMap['Developer 5'], 80, 'Assign']
    );

    const rev5cRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Database Optimization',
        '#119',
        'Clean orders logs collection',
        'Archive expired system events logs from MongoDB and optimize storage.',
        'SQL',
        'Low',
        'Low',
        '2026-09-15',
        'In Progress',
        adminId
      ]
    );
    const rev5cId = rev5cRes.rows[0].id;
    for (const tech of ['SQL', 'MongoDB']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev5cId, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev5cId, devIdMap['Developer 5'], 75, 80, 100, 50, 70, 100, 'In Progress']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev5cId, devIdMap['Developer 5'], 75, 'Assign']
    );

    // Review 6: Cloud Deployment Pipeline (Pending -> Expected Developer 6)
    const rev6Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Cloud Deployment Pipeline',
        '#220',
        'Configure ECS Deployment workflows',
        'Assemble Multi-stage Docker deployment pipeline using GitHub Actions and AWS CLI.',
        'Docker',
        'High',
        'High',
        '2026-08-29',
        'Pending',
        adminId
      ]
    );
    const rev6Id = rev6Res.rows[0].id;
    for (const tech of ['AWS', 'Docker', 'Kubernetes', 'CI/CD']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev6Id, tech]);
    }

    // Review 7: Security Audit Tool (Pending -> Expected Developer 7)
    const rev7Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Security Audit Tool',
        '#19',
        'Incorporate static code scanner',
        'Add python script checker and run scan logs against network permissions.',
        'Python',
        'Medium',
        'High',
        '2026-08-25',
        'Pending',
        adminId
      ]
    );
    const rev7Id = rev7Res.rows[0].id;
    for (const tech of ['Cybersecurity', 'Python', 'Linux']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev7Id, tech]);
    }

    // Seed 1 active review to Developer 7 to satisfy starting workload of 1:
    const rev7bRes = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Security Audit Tool',
        '#18',
        'Configure network iptables rules',
        'Set up access restrictions policies.',
        'Python',
        'Medium',
        'Medium',
        '2026-09-08',
        'Assigned',
        adminId
      ]
    );
    const rev7bId = rev7bRes.rows[0].id;
    for (const tech of ['Cybersecurity', 'Network Security']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev7bId, tech]);
    }
    await client.query(
      `INSERT INTO assignments (review_id, developer_id, score, expertise_score, availability_score, workload_score, experience_score, priority_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [rev7bId, devIdMap['Developer 7'], 78, 80, 100, 66, 40, 100, 'Assigned']
    );
    await client.query(
      `INSERT INTO assignment_history (review_id, developer_id, score, action)
       VALUES ($1, $2, $3, $4)`,
      [rev7bId, devIdMap['Developer 7'], 78, 'Assign']
    );

    // Review 8: Android Banking App (Pending -> Developer 8 is Unavailable, so it must return "No Reviewer Available")
    const rev8Res = await client.query(
      `INSERT INTO review_requests (repository_name, pull_request_id, title, description, language, priority, complexity, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        'Android Banking App',
        '#41',
        'Secure login screen Kotlin biometric checks',
        'Integrate Firebase auth backend and biometric fingerprint scanner framework.',
        'Kotlin',
        'High',
        'High',
        '2026-08-31',
        'Pending',
        adminId
      ]
    );
    const rev8Id = rev8Res.rows[0].id;
    for (const tech of ['Java', 'Android', 'Kotlin', 'Firebase']) {
      await client.query('INSERT INTO review_technologies (review_id, technology) VALUES ($1, $2)', [rev8Id, tech]);
    }

    await client.query('COMMIT');
    console.log('Database seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to seed database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Allow execution directly if called from command line
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeeder()
    .then(() => {
      console.log('Seeding complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
