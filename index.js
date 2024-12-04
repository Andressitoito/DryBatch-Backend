// src/index.js

// Import necessary libraries
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/database'); // Database connection

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Import models
const Product = require('./src/models/Product');
const Measurement = require('./src/models/Measurement');
const Container = require('./src/models/Container');

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
    await sequelize.sync(); // Use { force: true } during development to reset tables
    console.log('Database synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();


// Import routes
const productRoutes = require('./src/routes/products');
const exportRoutes = require('./src/routes/export');

// Use routes
app.use('/products', productRoutes);
app.use('/export', exportRoutes);

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
