// src/models/Product.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Update path if needed to match your structure

// Define the Product model
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Product;
