// models/scheduleSlot.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Availability from './availability.js';
import Patient from './patient.js';
import Appointment from './appointment.js';

const ScheduleSlot = db.define('ScheduleSlot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  availabilityId: { type: DataTypes.INTEGER, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.TIME, allowNull: false },
  status: {
    type: DataTypes.ENUM('available', 'booked', 'blocked'),
    defaultValue: 'available',
  },
  patientId: { type: DataTypes.INTEGER, allowNull: true },
  appointmentId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true,
});

ScheduleSlot.belongsTo(Availability, { foreignKey: 'availabilityId' });
Availability.hasMany(ScheduleSlot, { foreignKey: 'availabilityId' });

ScheduleSlot.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(ScheduleSlot, { foreignKey: 'patientId' });

ScheduleSlot.belongsTo(Appointment, { foreignKey: 'appointmentId' });

export default ScheduleSlot;
