import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import developerRoutes from './routes/developerRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { runSeeder } from './database/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS dynamically based on FRONTEND_URL env variable
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : '*';

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/developers', developerRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Database status checker & auto initializer
async function checkAndInitDatabase() {
  try {
    const tablesExist = await pool.checkTableExists('users');
    if (!tablesExist) {
      console.log('Database tables not found. Automatically running schema and seeding demo data...');
      await runSeeder();
    } else {
      console.log('Database connected and tables verified.');
    }
  } catch (error) {
    console.error('CRITICAL: Database connection/initialization failed!', error);
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'An unexpected internal error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await checkAndInitDatabase();
});
