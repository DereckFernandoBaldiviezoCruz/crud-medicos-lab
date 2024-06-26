import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Medic from './medic.js';
import Patient from './patient.js';

const Appointment = db.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  }
}, {
  timestamps: false,
});

// Define las relaciones
Appointment.belongsTo(Medic, { foreignKey: 'medicId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
Medic.hasMany(Appointment, { foreignKey: 'medicId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });

export default Appointment;
