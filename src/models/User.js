// src/models/User.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database'); 

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['name', 'lastName'],
    },
  ],
});

module.exports = User;
