const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/contact', require('./routes/contact'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Redirect reset links to the frontend page
app.get('/reset-password/:token', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/reset-password/${req.params.token}`);
});

app.get('/verify-email/:token', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/verify-email/${req.params.token}`);
});

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to FeedForward API v2.0',
    version: '2.0.0',
    features: [
      'Email Verification',
      'NGO Locking System',
      'Cloudinary Image Upload',
      'Contact Email Notifications'
    ],
    endpoints: {
      auth: '/api/auth',
      donations: '/api/donations',
      inspections: '/api/inspections',
      deliveries: '/api/deliveries',
      ngo: '/api/ngo',
      admin: '/api/admin',
      analytics: '/api/analytics',
      contact: '/api/contact'
    }
  });
});
console.log("Loading contact route...");
app.use('/api/contact', require('./routes/contact'));

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║     FeedForward API Server v2.0           ║
║                                           ║
║   🚀 Server running on port ${PORT}        ║
║   📱 Environment: ${process.env.NODE_ENV || 'development'}          ║
║   🌐 API URL: http://localhost:${PORT}     ║
║   ✉️  Email: ${process.env.EMAIL_HOST || 'Not configured'}             ║
║   ☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'}         ║
║                                           ║
╚═══════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
