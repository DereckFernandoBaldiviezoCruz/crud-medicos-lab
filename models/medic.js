// models/medic.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import User from './user.js';
import HealthCenter from '../healthCenter.js';
import Specialty from './specialty.js';

const Medic = db.define('Medic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  specialtyId: { type: DataTypes.INTEGER, allowNull: false }, // FK a Specialty
  healthCenterId: { type: DataTypes.INTEGER, allowNull: false }, // centro principal
}, {
  timestamps: true,
});

Medic.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Medic, { foreignKey: 'userId' });

Medic.belongsTo(Specialty, { foreignKey: 'specialtyId' });
Specialty.hasMany(Medic, { foreignKey: 'specialtyId' });

Medic.belongsTo(HealthCenter, { foreignKey: 'healthCenterId' });
HealthCenter.hasMany(Medic, { foreignKey: 'healthCenterId' });

export default Medic;
