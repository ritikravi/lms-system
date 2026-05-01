const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();

// Routes
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const issueRoutes = require('./routes/issue.routes');
const userRoutes = require('./routes/user.routes');
const fineRoutes = require('./routes/fine.routes');
const noticeRoutes = require('./routes/notice.routes');
const catalogueRoutes = require('./routes/catalogue.routes');
const eResourceRoutes = require('./routes/eresource.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Cron jobs
const { calculateDailyFines } = require('./utils/cronJobs');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      'https://lms-system.vercel.app',
      'https://lms-system-ritikravi.vercel.app',
      process.env.CLIENT_URL,
    ].filter(Boolean);
    if (!origin || allowed.some(o => origin.startsWith(o.replace('*', '')))) {
      return callback(null, true);
    }
    // Allow all vercel preview URLs
    if (origin.includes('vercel.app')) return callback(null, true);
    return callback(null, true); // allow all for now
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/catalogue', catalogueRoutes);
app.use('/api/eresources', eResourceRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'LMS API is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Run fine calculation every day at midnight
    cron.schedule('0 0 * * *', () => {
      console.log('⏰ Running daily fine calculation...');
      calculateDailyFines();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

module.exports = app;
