// src/models/Measurement.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Product = require('./Product');

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
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  productCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Product,
      key: 'code',
    },
  },
});

// Define relationships between Product and Measurement
Product.hasMany(Measurement, { foreignKey: 'productCode', sourceKey: 'code' });
Measurement.belongsTo(Product, { foreignKey: 'productCode', targetKey: 'code' });

module.exports = Measurement;
