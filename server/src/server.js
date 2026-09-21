import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
export const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: [clientUrl, 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'StudyBee API',
    message: 'Cozy Library server is buzzing happily! 🐝🍯',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);

// Socket.io basics
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to hive socket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found in the library archives.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal library error', error: err.message });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🍯 StudyBee Server running on port ${PORT}`);
    console.log(`🐝 Health check: http://localhost:${PORT}/api/health`);
  });
});
