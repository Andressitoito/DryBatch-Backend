// src/models/Measurement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Update path if needed to match your structure
const Product = require('./Product');
const Container = require('./Container');

// Define the Measurement model
const Measurement = sequelize.define('Measurement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  lastUpdatedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id',
    },
  },
});

// Define relationships between Measurement, Product, and Container
Product.hasMany(Measurement, { foreignKey: 'productId' });
Measurement.belongsTo(Product, { foreignKey: 'productId' });
Measurement.hasMany(Container, { foreignKey: 'measurementId' });
Container.belongsTo(Measurement, { foreignKey: 'measurementId' });

module.exports = Measurement;
