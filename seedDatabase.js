const dotenv = require('dotenv');
dotenv.config(); // Load environment variables

const sequelize = require('./src/database'); // Import the Sequelize instance
const Product = require('./src/models/Product'); // Import Product model
const Measurement = require('./src/models/Measurement'); // Import Measurement model

const seedDatabase = async () => {
  try {
    // Authenticate connection to the database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Synchronize models - use force or alter during development
    console.log('Starting model synchronization...');
    await sequelize.sync({ force: true }); // { alter: true } can be used alternatively
    console.log('Database models synchronized.');

    // Insert sample product
    const product = await Product.create({ name: 'Test Product', code: 'T001' });
    console.log(`Created product: ${product.name}, ID: ${product.id}`);

  } catch (error) {
    console.error('Unable to seed the database:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Run the function to seed the database
seedDatabase();
