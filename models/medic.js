import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import User from './user.js';

const Medic = db.define('Medic', {
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id',
    },
    allowNull: false,
  },
  speciality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});

User.hasOne(Medic, { foreignKey: 'userId' });
Medic.belongsTo(User, { foreignKey: 'userId' });

export default Medic;
