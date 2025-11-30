// models/availability.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Medic from './medic.js';
import HealthCenter from './healthCenter.js';

const Availability = db.define('Availability', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  medicId: { type: DataTypes.INTEGER, allowNull: false },
  healthCenterId: { type: DataTypes.INTEGER, allowNull: false },
  // 0=Sunday .. 6=Saturday (store as string to keep compatibility with ENUM style used elsewhere)
  dayOfWeek: { type: DataTypes.ENUM('0','1','2','3','4','5','6'), allowNull: false },
  startTime: { type: DataTypes.TIME, allowNull: false },
  endTime: { type: DataTypes.TIME, allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 15 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

Availability.belongsTo(Medic, { foreignKey: 'medicId' });
Medic.hasMany(Availability, { foreignKey: 'medicId' });

Availability.belongsTo(HealthCenter, { foreignKey: 'healthCenterId' });
HealthCenter.hasMany(Availability, { foreignKey: 'healthCenterId' });

export default Availability;
