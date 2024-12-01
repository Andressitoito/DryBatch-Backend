const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const exportRoutes = require('./src/routes/export');

// Use routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/export', exportRoutes);

// Connect to database
const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING);
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});