-- PostgreSQL Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables with CASCADE in dependency order
DROP TABLE IF EXISTS assignment_history CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS review_technologies CASCADE;
DROP TABLE IF EXISTS review_requests CASCADE;
DROP TABLE IF EXISTS developer_expertise CASCADE;
DROP TABLE IF EXISTS expertise CASCADE;
DROP TABLE IF EXISTS developers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Developer')),
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Developers table
CREATE TABLE developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    experience_years INT NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    availability VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Unavailable')),
    max_workload INT NOT NULL DEFAULT 3 CHECK (max_workload > 0),
    current_workload INT NOT NULL DEFAULT 0 CHECK (current_workload >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expertise table
CREATE TABLE expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL
);

-- Developer Expertise Join table (skill_level: 1 = Beginner, 2 = Intermediate, 3 = Expert)
CREATE TABLE developer_expertise (
    developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    expertise_id UUID NOT NULL REFERENCES expertise(id) ON DELETE CASCADE,
    skill_level INT NOT NULL DEFAULT 2 CHECK (skill_level BETWEEN 1 AND 3),
    PRIMARY KEY (developer_id, expertise_id)
);

-- Review Requests table
CREATE TABLE review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repository_name VARCHAR(255) NOT NULL,
    pull_request_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    language VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    complexity VARCHAR(50) NOT NULL CHECK (complexity IN ('Low', 'Medium', 'High')),
    deadline DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Review Technologies table
CREATE TABLE review_technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES review_requests(id) ON DELETE CASCADE,
    technology VARCHAR(100) NOT NULL
);

-- Assignments table
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL UNIQUE REFERENCES review_requests(id) ON DELETE CASCADE,
    developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    expertise_score INT NOT NULL DEFAULT 0,
    availability_score INT NOT NULL DEFAULT 0,
    workload_score INT NOT NULL DEFAULT 0,
    experience_score INT NOT NULL DEFAULT 0,
    priority_score INT NOT NULL DEFAULT 0,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Completed'))
);

-- Assignment History table
CREATE TABLE assignment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL,
    developer_id UUID NOT NULL,
    score INT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('Assign', 'Reassign', 'Complete', 'In Progress')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_developers_user_id ON developers(user_id);
CREATE INDEX idx_developer_expertise_dev_id ON developer_expertise(developer_id);
CREATE INDEX idx_review_technologies_review_id ON review_technologies(review_id);
CREATE INDEX idx_assignments_review_id ON assignments(review_id);
CREATE INDEX idx_assignments_developer_id ON assignments(developer_id);
