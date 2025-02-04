// Import necessary libraries
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/database'); // Database connection
const SequelizeStore = require('connect-session-sequelize')(session.Store); // Sequelize session store

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000', // Development
  'https://your-production-domain.com', // Replace with your production domain
];

// CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent with requests
  })
);

// Middleware for parsing JSON
app.use(express.json());

// Configure session store with Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize, // Use Sequelize instance
});

// Initialize session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultSecret', // Replace with a secure secret in production
    store: sessionStore, // Use Sequelize or your session store
    resave: false, // Don't save unchanged sessions
    saveUninitialized: false, // Don't save empty sessions
    cookie: {
      secure: false, // Set to false for development (no HTTPS)
      httpOnly: true, // Prevent access to cookies via JavaScript
      sameSite: 'None', // Allow cross-origin requests
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    },
  })
);

app.use((req, res, next) => {
  console.log("Incoming cookies:", req.headers.cookie);
  next();
});

// Import models
const Product = require('./src/models/Product');
const Measurement = require('./src/models/Measurement');
const Container = require('./src/models/Container');
const User = require('./src/models/User');

// Define model relationships
Product.hasMany(Measurement, { foreignKey: 'productId', onDelete: 'CASCADE' });
Measurement.belongsTo(Product, { foreignKey: 'productId' });
Measurement.hasMany(Container, { foreignKey: 'measurementId', onDelete: 'CASCADE' });
Container.belongsTo(Measurement, { foreignKey: 'measurementId' });

// Sync database and session store
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models
    await sequelize.sync();
    console.log('Database synchronized.');

    // Sync the session store table
    sessionStore.sync();
    console.log('Session store table synchronized.');
  } catch (error) {
    console.error('Error during database synchronization:', error);
  }
})();

// Import routes
const productRoutes = require('./src/routes/products');
const exportRoutes = require('./src/routes/export');
const authRoutes = require('./src/routes/auth');

// Use routes
app.use('/products', productRoutes);
app.use('/export', exportRoutes);
app.use('/auth', authRoutes);

// Default route for health checks or debugging
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
