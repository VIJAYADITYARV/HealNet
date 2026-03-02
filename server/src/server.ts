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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── 1. Core parsing & CORS (must come FIRST) ──────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// ── 2. Security headers ────────────────────────────────────────
app.use(helmet({ xssFilter: false }));

// ── 4. Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
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

app.get('/', (_req, res) => {
  res.send('API is running...');
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
