import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import shopRoutes from './routes/shopRoutes.js';

import hiveRoutes from './routes/hiveRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { setupSocketHandler } from './sockets/socketHandler.js';

import { apiLimiter } from './middleware/rateLimitMiddleware.js';

import { validateEnv } from './config/envValidator.js';

dotenv.config();
validateEnv();

const app = express();
const server = http.createServer(app);

// Strict CORS Configuration: only authorize the actual frontend origin
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const allowedOrigins = [clientUrl];
if (process.env.NODE_ENV !== 'production' && !allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: Origin "${origin}" is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Configure Socket.io with strict origin policy
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'StudyHive API',
    message: 'Cozy Library server is buzzing happily! 🐝🍯',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/hives', hiveRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Socket.io handlers
setupSocketHandler(io);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found in the library archives.' });
});

// Global error handler (production-safe, never leaks stack traces)
app.use((err, req, res, next) => {
  console.error('StudyHive Server error:', err);

  // Handle CORS blocked origin errors
  if (err.message && err.message.includes('CORS blocked')) {
    return res.status(403).json({
      message: 'Access forbidden: Origin is not permitted.',
      error: 'CORS Forbidden',
    });
  }

  // Handle invalid Mongoose ObjectId casting
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: `Invalid format for resource identifier: ${err.value}`,
      error: 'Bad Request',
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors).map((e) => e.message).join(', '),
      error: 'Validation Error',
    });
  }

  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const userMessage = statusCode === 500 && isProd
    ? 'An unexpected error occurred in the library archives. Please try again.'
    : (err.message || 'Internal library error');

  res.status(statusCode).json({
    message: userMessage,
    error: isProd && statusCode === 500 ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    ...(isProd ? {} : { stack: err.stack }),
  });
});

// Guard against unhandled rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception thrown:', err);
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🍯 StudyHive Server running on port ${PORT}`);
    console.log(`🐝 Health check: http://localhost:${PORT}/api/health`);
  });
});
