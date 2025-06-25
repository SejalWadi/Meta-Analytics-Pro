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
import optimizationRoutes from './routes/optimization-recommendations.js';

// Import middleware
import { authenticateToken, optionalAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://localhost:5173',
      // Add your deployed frontend URLs here
      /\.vercel\.app$/,
      /\.netlify\.app$/,
      /\.herokuapp\.com$/
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware setup
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://graph.facebook.com", "https://connect.facebook.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://connect.facebook.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors(corsOptions));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter with more lenient settings for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More requests in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// IIFE to handle async initialization
(async () => {
  // Database connection (optional - graceful fallback if not available)
  let db;
  try {
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
      db = await createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'meta_analytics',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
      });
      console.log('✅ Connected to MySQL database');
      app.locals.db = db;
    } else {
      console.log('⚠️ Database configuration not found, running without database');
    }
  } catch (error) {
    console.warn('⚠️ Database connection failed, continuing without database:', error.message);
  }

  // Redis connection (optional - graceful fallback if not available)
  let redisClient;
  if (process.env.REDIS_URL) {
    try {
      redisClient = Redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          lazyConnect: true,
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.log('Redis server connection refused.');
            return undefined; // Don't retry
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.log('Redis retry time exhausted.');
            return undefined; // Don't retry
          }
          if (options.attempt > 3) {
            console.log('Redis max attempts reached.');
            return undefined; // Don't retry
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });
      
      await redisClient.connect();
      console.log('✅ Connected to Redis');
      app.locals.redis = redisClient;
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without Redis:', error.message);
    }
  } else {
    console.log('⚠️ Redis URL not configured, running without Redis');
  }

  // Health check route
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: db ? 'connected' : 'not configured',
        redis: redisClient ? 'connected' : 'not configured'
      },
      version: '1.0.0'
    });
  });

  // API status endpoint
  app.get('/api/status', (req, res) => {
    res.json({
      status: 'API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        analytics: '/api/analytics',
        accounts: '/api/accounts',
        reports: '/api/reports',
        metrics: '/api/metrics',
        optimization: '/api/optimization-recommendations'
      }
    });
  });

  // Public routes (no authentication required)
  app.use('/api/auth', authRoutes);

  // Protected routes (require authentication, but graceful fallback)
  app.use('/api/analytics', optionalAuth, analyticsRoutes);
  app.use('/api/accounts', optionalAuth, accountsRoutes);
  app.use('/api/reports', optionalAuth, reportsRoutes);
  app.use('/api/metrics', optionalAuth, metricsRoutes);
  app.use('/api/optimization-recommendations', optionalAuth, optimizationRoutes);

  // Catch-all route for undefined endpoints
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      error: 'API endpoint not found',
      availableEndpoints: [
        '/api/auth',
        '/api/analytics',
        '/api/accounts',
        '/api/reports',
        '/api/metrics',
        '/api/optimization-recommendations'
      ]
    });
  });

  // Global error handler middleware
  app.use(errorHandler);

  // Start the server
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API status: http://localhost:${PORT}/api/status`);
  });

  // Enhanced graceful shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);

    // Stop accepting new connections
    server.close(async () => {
      console.log('HTTP server closed');

      // Close database connection
      if (db) {
        try {
          await db.end();
          console.log('Database connection closed');
        } catch (error) {
          console.error('Error closing database:', error);
        }
      }

      // Close Redis connection
      if (redisClient) {
        try {
          await redisClient.quit();
          console.log('Redis connection closed');
        } catch (error) {
          console.error('Error closing Redis:', error);
        }
      }

      console.log('Graceful shutdown completed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
})();

export default app;