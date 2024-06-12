const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/database.js');

const Medic = sequelize.define("Medic", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
  },
  speciality: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  services: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  certifications: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: "activo",
  },
}, {
  timestamps: false,
});

module.exports = { Medic };
