// src/models/Measurement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Update path if needed to match your structure
const Product = require('./Product');

// Define the Measurement model
const Measurement = sequelize.define('Measurement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tare: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  initialGross: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currentGross: {
    type: DataTypes.FLOAT,
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

// Define relationships between Measurement and Product
Product.hasMany(Measurement, { foreignKey: 'productId' });
Measurement.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Measurement;
