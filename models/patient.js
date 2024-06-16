import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import User from './user.js'; // Importa el modelo User

const Patient = db.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  medicalHistory: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Define la relación entre Patient y User
Patient.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Patient, { foreignKey: 'userId' });

export default Patient;
