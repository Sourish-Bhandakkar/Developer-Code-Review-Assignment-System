-- Drop tables in dependency order for SQLite (does not support CASCADE in DROP)
DROP TABLE IF EXISTS assignment_history;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS review_technologies;
DROP TABLE IF EXISTS review_requests;
DROP TABLE IF EXISTS developer_expertise;
DROP TABLE IF EXISTS expertise;
DROP TABLE IF EXISTS developers;
DROP TABLE IF EXISTS users;

-- Helper UUID Generator for SQLite
-- Generates standard 36-char RFC-4122 compliant v4 UUID strings natively
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Developer')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Developers table
CREATE TABLE developers (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    availability TEXT NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Unavailable')),
    max_workload INTEGER NOT NULL DEFAULT 3 CHECK (max_workload > 0),
    current_workload INTEGER NOT NULL DEFAULT 0 CHECK (current_workload >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expertise table
CREATE TABLE expertise (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    name TEXT UNIQUE NOT NULL
);

-- Developer Expertise Join table (skill_level: 1 = Beginner, 2 = Intermediate, 3 = Expert)
CREATE TABLE developer_expertise (
    developer_id TEXT NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    expertise_id TEXT NOT NULL REFERENCES expertise(id) ON DELETE CASCADE,
    skill_level INTEGER NOT NULL DEFAULT 2 CHECK (skill_level BETWEEN 1 AND 3),
    PRIMARY KEY (developer_id, expertise_id)
);

-- Review Requests table
CREATE TABLE review_requests (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    repository_name TEXT NOT NULL,
    pull_request_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    language TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    complexity TEXT NOT NULL CHECK (complexity IN ('Low', 'Medium', 'High')),
    deadline TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed')),
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Review Technologies table
CREATE TABLE review_technologies (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    review_id TEXT NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
    technology TEXT NOT NULL
);

-- Assignments table
CREATE TABLE assignments (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    review_id TEXT NOT NULL UNIQUE REFERENCES review_requests(id) ON DELETE CASCADE,
    developer_id TEXT NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    expertise_score INTEGER NOT NULL DEFAULT 0,
    availability_score INTEGER NOT NULL DEFAULT 0,
    workload_score INTEGER NOT NULL DEFAULT 0,
    experience_score INTEGER NOT NULL DEFAULT 0,
    priority_score INTEGER NOT NULL DEFAULT 0,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Completed'))
);

-- Assignment History table
CREATE TABLE assignment_history (
    id TEXT PRIMARY KEY DEFAULT (
        lower(hex(randomblob(4))) || '-' || 
        lower(hex(randomblob(2))) || '-4' || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        substr('89ab',abs(random()) % 4 + 1, 1) || 
        substr(lower(hex(randomblob(2))),2) || '-' || 
        lower(hex(randomblob(6)))
    ),
    review_id TEXT NOT NULL,
    developer_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('Assign', 'Reassign', 'Complete', 'In Progress')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_developers_user_id ON developers(user_id);
CREATE INDEX idx_developer_expertise_dev_id ON developer_expertise(developer_id);
CREATE INDEX idx_review_technologies_review_id ON review_technologies(review_id);
CREATE INDEX idx_assignments_review_id ON assignments(review_id);
CREATE INDEX idx_assignments_developer_id ON assignments(developer_id);
