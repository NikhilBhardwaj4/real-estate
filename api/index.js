import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';

dotenv.config();

const app = express();

// CORS setup — allows frontend to talk to backend
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-netlify-app.netlify.app'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve static files from client/dist (optional on Render)
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/client/dist')));

// API routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Fallback route for SPA (React Router support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Port from .env or fallback
const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });
