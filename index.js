const express = require('express');
const path = require('path');
const { rootMainFile } = require('./utils/path');
const app = express();
const PORT = process.env.PORT || 3000;

require('./config/db/firebase');

const authRoutes = require("./routes/auth")
const homeRoutes = require("./routes/homeRoute")
const userRoutes = require("./routes/userpage")

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(rootMainFile, 'views'));

// Middleware
app.use(express.static(path.join(rootMainFile, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', homeRoutes)
app.use('/user' , userRoutes)
app.use('/auth' , authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
// app.use((req, res) => {
//   res.status(404).render('404', { title: 'Page Not Found' });
// });

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Access: http://localhost:${PORT}`);
});