import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import reportAggregationsRoutes from './routes/reportAggregationsRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import likeRoutes from './routes/likeRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── 1. Core parsing & CORS (must come FIRST) ──────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [/\.vercel\.app$/, 'http://localhost:5173'] // Matches any vercel deployment
    : true,
  credentials: true
}));

// DEBUG LOGGING
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[REQ] ${req.method} ${req.url} (on port ${PORT})`);
    if (req.url.startsWith('/api/comments') || req.url.startsWith('/api/likes')) {
      console.log(`[DEBUG] Reached comment/like controller for URL: ${req.url}`);
    }
  }
  next();
});

// ── 2. Security headers ────────────────────────────────────────
app.use(helmet({ xssFilter: false }));

// ── 4. Rate Limiting (Disabled for Dev) ───────────────────────────
/*
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, 
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login/register attempts, please try again after 15 minutes'
});

const queryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many AI requests, please try again later'
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);
app.use('/api/query', queryLimiter);
app.use('/api/ai/query', queryLimiter);
app.use('/api/voice', queryLimiter);
*/

// ── 5. Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports-data', reportAggregationsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/test-proxy', (req, res) => {
  res.json({ message: 'Proxy is working correctly', timestamp: new Date() });
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/', (_req, res) => {
  res.send('API is running...');
});

// ── 5.5 Match-all 404 for debugging ──────────────────────────
app.use((req, res) => {
  if (req.url.startsWith('/api')) {
    console.warn(`[404-Server] Unmatched route: ${req.method} ${req.url}`);
  }
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found on this server` });
});

// ── 6. Global error handler ────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── 7. Start ───────────────────────────────────────────────────
connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
