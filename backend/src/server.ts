import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import pool from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './services/socketService';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import logger from './utils/logger';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Database connection check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed:', err);
    process.exit(1);
  }
  logger.info('✓ Database connected');
});

// Start server
const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    server.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      logger.info(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Hospital Management System API                          ║
║   Server: http://localhost:${PORT}                       ║
║   Health: http://localhost:${PORT}/api/v1/health         ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    pool.end();
    process.exit(0);
  });
});

export default app;
