// Import necessary libraries
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/database'); // Updated path to your database connection
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Import Sequelize session store

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configure session store with Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize, // Use your existing Sequelize instance
});

// Initialize session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Ensure you have SESSION_SECRET in your .env file
    store: sessionStore,
    resave: false, // Prevent session being saved back to the store if it hasn't been modified
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      secure: false, // Set to true if you're using HTTPS
      httpOnly: true, // Helps mitigate XSS attacks
      maxAge: 7 * 24 * 60 * 60 * 1000, // Session expiry: 7 day
    },
  })
);

// Import models
const Product = require('./src/models/Product');
const Measurement = require('./src/models/Measurement');
const Container = require('./src/models/Container');
const User = require('./src/models/User'); // Add User model for authentication

// Define model relationships
Product.hasMany(Measurement, { foreignKey: 'productId' });
Measurement.belongsTo(Product, { foreignKey: 'productId' });
Measurement.hasMany(Container, { foreignKey: 'measurementId' });
Container.belongsTo(Measurement, { foreignKey: 'measurementId' });

// This sync will ensure tables are created before handling any requests
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Synchronize all models
    await sequelize.sync( ); // Use { force: true } during development to reset tables
    console.log('Database synchronized.');

    // Sync the session store table
    sessionStore.sync();
    console.log('Session store table synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// Import routes
const productRoutes = require('./src/routes/products');
const exportRoutes = require('./src/routes/export');
const authRoutes = require('./src/routes/auth'); // Add authentication routes

// Use routes
app.use('/products', productRoutes);
app.use('/export', exportRoutes);
app.use('/auth', authRoutes); // Add authentication route prefix

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
