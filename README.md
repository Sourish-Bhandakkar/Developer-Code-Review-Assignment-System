# Developer Code Review Assignment System

An automated, intelligent, and explainable review-routing application designed for software development teams. The system analyzes incoming pull request requests, evaluates developer profiles (domain expertise, workload capacity, availability, experience), and automatically routes assignments using a weighted decision algorithm.

This project is built as a complete full-stack web application suitable for academic demonstration (college Software Engineering and Quality Assurance Project-Based Learning TAE-1). It uses a zero-setup, file-based SQLite database that bootstraps and seeds itself automatically upon starting the backend.

---

## 1. Project Objectives

- **Automated Routing**: Replace manual review assignments with an automated routing engine.
- **Workload Balancing**: Distribute reviews evenly to prevent burnout and review bottlenecks.
- **Expertise Alignment**: Match code files to developers with relevant technical experience.
- **Explainable Decisions**: Display mathematically transparent suitability scores and breakdowns for audits.
- **Manual Overrides**: Allow administrators to override routing decisions and workload limits in emergency scenarios.

---

## 2. System Architecture

The application is structured as a decoupled full-stack architecture:

- **Frontend**: Single Page Application (SPA) built using React, Vite, and Tailwind CSS. Data visualizations are rendered via Recharts, and icons are loaded from Lucide React.
- **Backend**: RESTful API server built using Node.js and Express.js.
- **Database**: Local file-based SQLite relational database (`backend/database/review_assignment.db`), configured with strict foreign keys, indexing, and cascade rules.
- **Security**: JWT-based token authorization, password encryption with Bcrypt, and CORS configuration.

---

## 3. Database Schema Design

The relational structure enforces the following constraints:

1. **Users**: System authentication records. Roles are restricted to `Admin` or `Developer`.
2. **Developers**: Links to `Users`. Tracks `experience_years`, `availability` (`Available`, `Busy`, `Unavailable`), `max_workload` (cap), and `current_workload` (active counts).
3. **Expertise**: Unique technical skill keywords (e.g., `Java`, `React`, `PostgreSQL`).
4. **Developer Expertise**: Join table linking developers to skills with specific `skill_level` rankings (1 = Beginner, 2 = Intermediate, 3 = Expert).
5. **Review Requests**: PR requests tracking languages, priorities (`Low`, `Medium`, `High`, `Critical`), deadlines, and routing statuses.
6. **Review Technologies**: Required technical tag lists for each PR.
7. **Assignments**: Core links representing selected reviewers and individual score breakdowns.
8. **Assignment History**: Audit trail logging actions (`Assign`, `Reassign`, `Complete`, `In Progress`) for reviews.

---

## 4. Weighted Scoring Algorithm

The matching engine selects reviewers using the following weight metrics:

$$ \text{Final Score} = (\text{Expertise Match} \times 0.40) + (\text{Availability} \times 0.20) + (\text{Workload} \times 0.20) + (\text{Experience} \times 0.10) + (\text{Priority Fit} \times 0.10) $$

### Factor Scores
1. **Expertise Match (40%)**:
   Calculated based on requested technologies matching the developer's skill grid:
   $$\text{Expertise Score} = \left( \frac{\text{matching\_techs}}{\text{requested\_techs}} \times 60 \right) + \left( \frac{\text{average\_skill\_level\_of\_matches}}{3} \times 40 \right)$$
2. **Availability (20%)**:
   - `Available` status = 100 points
   - `Busy` status = 50 points
   - `Unavailable` status = Excluded from routing
3. **Workload (20%)**:
   Prefers developers with lower active review counts relative to their max capacity:
   $$\text{Workload Score} = \left( 1 - \frac{\text{current\_workload}}{\text{max\_workload}} \right) \times 100$$
4. **Experience (10%)**:
   Points based on tenure, capped at 10 years for scoring:
   $$\text{Experience Score} = \min(100, \text{experience\_years} \times 10)$$
5. **Priority / Deadline Fit (10%)**:
   - For `High` or `Critical` priorities: Favors available and low-workload candidates:
     $$\text{Priority Score} = (\text{Availability Score} \times 0.6) + (\text{Workload Score} \times 0.4)$$
   - For `Medium` or `Low` priorities:
     $$\text{Priority Score} = 100$$

---

## 5. API Documentation

### Authentication
- `POST /api/auth/register` - Create developer account.
- `POST /api/auth/login` - Authenticate and return JWT token.
- `GET /api/auth/me` - Fetch profile metadata for active session.

### Developers
- `GET /api/developers` - List all developers and their skill grids.
- `POST /api/developers` - Add new developer profile (Admin only).
- `GET /api/developers/:id` - Fetch single developer profile details.
- `PUT /api/developers/:id` - Update profile, experience, capacity, and expertises.
- `PUT /api/developers/:id/availability` - Toggle active availability status.
- `DELETE /api/developers/:id` - Delete developer account (Admin only).

### Reviews & Assignments
- `GET /api/reviews` - Fetch review requests (supports filtering).
- `POST /api/reviews` - Submit review request (triggers auto-routing).
- `GET /api/reviews/:id` - Fetch details, active score breakdown, and history.
- `PUT /api/reviews/:id/status` - Modify status (Assigned, In Progress, Completed).
- `GET /api/reviews/:id/eligible` - Calculate potential scores for manual reassignment (Admin only).
- `POST /api/reviews/:id/assign` - Re-trigger automatic assignment (Admin only).
- `POST /api/reviews/:id/reassign` - Force manual override assignment (Admin only).
- `GET /api/reviews/stats` - Fetch dashboard analytics and charts.
- `GET /api/reviews/history` - Fetch full assignment history logs.

---

## 6. Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- No database installation required! (Uses an embedded, file-based SQLite database).

### 1. Environment Variables Configuration
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=demo_key_1234567890
JWT_EXPIRES_IN=7d
```

### 2. Install & Start Backend
From the project root:
```bash
cd backend
npm install
npm run start
```
*Note: The backend will automatically create the SQLite database file and seed all demo data on first launch!*

### 3. Install & Start Frontend
From another terminal window in the project root:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. Demo Accounts & Credentials

Use these credentials to demonstrate system authorization:

- **Admin/Team Lead** (Sourish Bhandakkar):
  - Email: `admin@company.com`
  - Password: `admin123`
- **Developer Accounts**:
  - Emails: `developer1@company.com` through `developer8@company.com`
  - Password: `password123` (Same password for all developers)

---

## 8. Verifying the Demo Scenario

To demonstrate the core algorithm during your viva:
1. Log in as **Sourish Bhandakkar** (Admin).
2. Go to **Review Requests** and click **New Review Request**.
3. Create a request for **E-Commerce Frontend** with tags `React`, `JavaScript`, and `Node.js` (Priority `Medium`, Complexity `Low`).
4. Click **Submit**.
5. **Expected Engine Behavior**:
   - **Developer 2** is selected as the best reviewer since their expertise perfectly aligns and their workload is `0/3` (Available).
   - The workload of **Developer 2** will automatically increment from `0` to `1` upon routing.
6. Submit a high-priority request with required technologies `Java`, `Android`, `Kotlin`, `Firebase`.
7. **Expected Engine Behavior**:
   - **Developer 8** matches the technology requirements but is marked `Unavailable`. 
   - The engine correctly excludes Developer 8 and alerts **"No Reviewer Available"** along with a clear visual table of routing exclusions.
