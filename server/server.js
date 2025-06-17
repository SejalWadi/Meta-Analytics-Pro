import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';
import Redis from 'redis';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import analyticsRoutes from './routes/analytics.js';
import accountsRoutes from './routes/accounts.js';
import reportsRoutes from './routes/reports.js';
import metricsRoutes from './routes/metrics.js';
import optimizationRoutes from './routes/optimization-recommendations.js'; // ✅ NEW: Optimization route

// Import middleware
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// IIFE to handle async initialization
(async () => {
  // Database connection
  let db;
  try {
    db = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Sejal@2005',
      database: process.env.DB_NAME || 'meta_analytics',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connected to MySQL database');
    app.locals.db = db;
  } catch (error) {
    console.error('Database connection failed:', error);
  }

  // Redis connection
  let redisClient;
  if (process.env.REDIS_URL) {
    try {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL
      });
      await redisClient.connect();
      console.log('Connected to Redis');
      app.locals.redis = redisClient;
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {
        database: db ? 'connected' : 'disconnected',
        redis: redisClient ? 'connected' : 'disconnected'
      }
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/analytics', authenticateToken, analyticsRoutes);
  app.use('/api/accounts', authenticateToken, accountsRoutes);
  app.use('/api/reports', authenticateToken, reportsRoutes);
  app.use('/api/metrics', authenticateToken, metricsRoutes);
  app.use('/api/optimization-recommendations', authenticateToken, optimizationRoutes); // ✅

  // Error handler
  app.use(errorHandler);

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');

    if (db) {
      await db.end();
      console.log('Database connection closed');
    }

    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }

    process.exit(0);
  });
})();

export default app;
