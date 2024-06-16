import { DataTypes, Model } from 'sequelize';
import sequelize from '../database/database.js';
import User from './user.js'; // Importa el modelo User si es necesario

class Medic extends Model {}

Medic.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Esto depende de tu diseño de base de datos
    },
    speciality: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Medic',
  }
);

Medic.belongsTo(User, { foreignKey: 'userId' }); // Define la relación con User si es necesario

export default Medic;
