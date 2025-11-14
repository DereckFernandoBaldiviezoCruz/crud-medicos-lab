// models/appointment.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Medic from './medic.js';
import Patient from './patient.js';
import HealthCenter from './healthCenter.js';
import Specialty from './specialty.js';

const Appointment = db.define('Appointment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  type: {
    type: DataTypes.ENUM('first', 'followup', 'specialist'),
    defaultValue: 'first',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'attended', 'cancelled', 'no_show'),
    defaultValue: 'pending',
  },
  reason: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  parentAppointmentId: { type: DataTypes.INTEGER, allowNull: true }, // para reconsulta
}, {
  timestamps: true,
});

Appointment.belongsTo(Medic, { foreignKey: 'medicId' });
Medic.hasMany(Appointment, { foreignKey: 'medicId' });

Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });

Appointment.belongsTo(HealthCenter, { foreignKey: 'healthCenterId' });
HealthCenter.hasMany(Appointment, { foreignKey: 'healthCenterId' });

Appointment.belongsTo(Specialty, { foreignKey: 'specialtyId' });
Specialty.hasMany(Appointment, { foreignKey: 'specialtyId' });

Appointment.belongsTo(Appointment, {
  as: 'Parent',
  foreignKey: 'parentAppointmentId',
});

export default Appointment;
