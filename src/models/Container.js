// src/models/Container.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path if needed

// Define the Container model
const Container = sequelize.define('Container', {
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
  measurementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Measurements', // This references the Measurement table
      key: 'id',
    },
  },
});

module.exports = Container;
