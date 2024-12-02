// src/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Make sure this is called at the very beginning

const sequelize = new Sequelize(
  'drybatch_db', // Database name
  'avnadmin',    // Database username
  process.env.DB_PASSWORD, // Password loaded from .env file
  {
    host: 'drybatch-backend-sql-drybatch-backend.g.aivencloud.com',
    port: 11002,
    dialect: 'mysql',
    logging: console.log, // Enable Sequelize logging
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    },
  }
);

module.exports = sequelize;
