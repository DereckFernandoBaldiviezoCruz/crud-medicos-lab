import { DataTypes } from 'sequelize';
import db from '../database/database.js';
import User from './user.js'; // Importa el modelo User

const Medic = db.define('Medic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: { // Asegúrate de que userId está definido aquí
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  speciality: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  timestamps: true,
});

// Define la relación entre Medic y User
Medic.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Medic, { foreignKey: 'userId' });

export default Medic;
