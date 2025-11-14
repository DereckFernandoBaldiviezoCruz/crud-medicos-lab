// models/consultation.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Appointment from './appointment.js';
import Medic from './medic.js';
import Patient from './patient.js';

const Consultation = db.define('Consultation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  timestamps: true,
});

Consultation.belongsTo(Appointment, { foreignKey: 'appointmentId' });
Appointment.hasOne(Consultation, { foreignKey: 'appointmentId' });

Consultation.belongsTo(Medic, { foreignKey: 'medicId' });
Medic.hasMany(Consultation, { foreignKey: 'medicId' });

Consultation.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Consultation, { foreignKey: 'patientId' });

export default Consultation;
