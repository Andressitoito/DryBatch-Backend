const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Product = require('./Product');

const Batch = sequelize.define('Batch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id',
    },
  },
  containerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tareWeight: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  initialGrossWeight: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  currentGrossWeight: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  lastUpdatedBy: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

Product.hasMany(Batch, { foreignKey: 'productId' });
Batch.belongsTo(Product, { foreignKey: 'productId' });

module.exports = Batch;
