// src/models/Product.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Correct the path if it's in ../database

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
    unique: true,
    allowNull: false,
  },
}, {
  tableName: 'Products', // Explicitly define the table name
  timestamps: true,
});

module.exports = Product;
