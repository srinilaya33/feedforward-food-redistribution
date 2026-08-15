const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// ============================================
// ROUTES
// ============================================

app.use('/api/auth', require('./routes/auth'));

app.use('/api/donations', require('./routes/donations'));

app.use('/api/inspections', require('./routes/inspections'));

app.use('/api/deliveries', require('./routes/deliveries'));

app.use('/api/ngo', require('./routes/ngo'));

app.use('/api/admin', require('./routes/admin'));

app.use('/api/analytics', require('./routes/analytics'));

app.use('/api/contact', require('./routes/contact'));

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// PASSWORD RESET REDIRECT
// ============================================

app.get('/reset-password/:token', (req, res) => {
  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  res.redirect(
    `${frontendUrl}/reset-password/${req.params.token}`
  );
});

// ============================================
// EMAIL VERIFICATION REDIRECT
// ============================================

app.get('/verify-email/:token', (req, res) => {
  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  res.redirect(
    `${frontendUrl}/verify-email/${req.params.token}`
  );
});

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to FeedForward API v2.0',
    version: '2.0.0',

    features: [
      'Email Verification',
      'NGO Locking System',
      'Cloudinary Image Upload',
      'Contact Email Notifications',
    ],

    endpoints: {
      auth: '/api/auth',
      donations: '/api/donations',
      inspections: '/api/inspections',
      deliveries: '/api/deliveries',
      ngo: '/api/ngo',
      admin: '/api/admin',
      analytics: '/api/analytics',
      contact: '/api/contact',
    },
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     FeedForward API Server v2.0           ║
║                                           ║
║   🚀 Server running on port ${PORT}        ║
║   📱 Environment: ${process.env.NODE_ENV || 'development'}          ║
║   🌐 API URL: http://localhost:${PORT}     ║
║   ✉️  Email: ${process.env.EMAIL_HOST ? 'Configured' : 'Not configured'}       ║
║   ☁️  Cloudinary: ${
        process.env.CLOUDINARY_CLOUD_NAME
          ? 'Configured'
          : 'Not configured'
      }         ║
║                                           ║
╚═══════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`Unhandled Promise Rejection: ${err.message}`);

      server.close(() => {
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');

      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');

      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;