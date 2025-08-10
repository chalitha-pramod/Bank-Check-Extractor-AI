const express = require('express');
const cors = require('cors');
const path = require('path');
const { router: authRouter } = require('./routes/auth');
const checksRouter = require('./routes/checks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/checks', checksRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Bank Check AI Server is running', 
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Test database endpoint
app.get('/api/test-db', (req, res) => {
  const db = require('./database');
  db.get('SELECT 1 as test', (err, row) => {
    if (err) {
      console.error('Database test failed:', err);
      res.status(500).json({ 
        message: 'Database connection failed', 
        error: err.message 
      });
    } else {
      res.json({ 
        message: 'Database connection successful', 
        test: row 
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Export for Vercel
module.exports = app;
