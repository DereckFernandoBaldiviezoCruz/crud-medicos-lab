// models/referral.js
import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import Patient from './patient.js';
import Medic from './medic.js';
import HealthCenter from '../healthCenter.js';
import Specialty from './specialty.js';

const Referral = db.define('Referral', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('requested', 'scheduled', 'completed', 'cancelled'),
    defaultValue: 'requested',
  },
}, {
  timestamps: true,
});

Referral.belongsTo(Patient, { foreignKey: 'patientId' });
Patient.hasMany(Referral, { foreignKey: 'patientId' });

Referral.belongsTo(Medic, { as: 'fromMedic', foreignKey: 'fromMedicId' });
Medic.hasMany(Referral, { as: 'ReferralsFrom', foreignKey: 'fromMedicId' });

Referral.belongsTo(Medic, { as: 'toMedic', foreignKey: 'toMedicId' });
Medic.hasMany(Referral, { as: 'ReferralsTo', foreignKey: 'toMedicId' });

Referral.belongsTo(HealthCenter, {
  as: 'fromCenter',
  foreignKey: 'fromCenterId',
});
Referral.belongsTo(HealthCenter, {
  as: 'toCenter',
  foreignKey: 'toCenterId',
});

Referral.belongsTo(Specialty, { foreignKey: 'specialtyId' });
Specialty.hasMany(Referral, { foreignKey: 'specialtyId' });

export default Referral;
