// models/patient.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import User from './user.js';
import HealthCenter from './healthCenter.js';

const Patient = db.define('Patient', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  healthCenterId: { type: DataTypes.INTEGER, allowNull: false },
  medicalHistorySummary: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

Patient.belongsTo(User, { foreignKey: 'userId', as: 'User' });
User.hasOne(Patient, { foreignKey: 'userId', as: 'Patient' });

Patient.belongsTo(HealthCenter, { foreignKey: 'healthCenterId' });
HealthCenter.hasMany(Patient, { foreignKey: 'healthCenterId' });

export default Patient;
