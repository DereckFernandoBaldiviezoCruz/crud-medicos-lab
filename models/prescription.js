// models/prescription.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Consultation from './consultation.js';
import Medic from './medic.js';
import Patient from './patient.js';
import HealthCenter from './healthCenter.js';

const Prescription = db.define('Prescription', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false }, // texto de la receta
}, {
  timestamps: true,
});

Prescription.belongsTo(Consultation, { foreignKey: 'consultationId' });
Consultation.hasOne(Prescription, { foreignKey: 'consultationId' });

Prescription.belongsTo(Medic, { foreignKey: 'medicId' });
Medic.hasMany(Prescription, { foreignKey: 'medicId' });

Prescription.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Prescription, { foreignKey: 'patientId' });

Prescription.belongsTo(HealthCenter, { foreignKey: 'healthCenterId' });
HealthCenter.hasMany(Prescription, { foreignKey: 'healthCenterId' });

export default Prescription;
