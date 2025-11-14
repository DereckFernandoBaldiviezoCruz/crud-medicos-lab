// models/healthCenter.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';

const HealthCenter = db.define('HealthCenter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  level: { type: DataTypes.ENUM('I', 'II', 'III'), allowNull: false },
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING, defaultValue: 'Sucre' },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

export default HealthCenter;
