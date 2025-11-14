// models/specialty.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';

const Specialty = db.define('Specialty', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
  isGeneral: { type: DataTypes.BOOLEAN, defaultValue: false }, // true = Médico General
}, {
  timestamps: false,
});

export default Specialty;
