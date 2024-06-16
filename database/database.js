// database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const db = new Sequelize('api_medic', 'dereck', 'mApgDMRQDO1xsd2TXof1rOOCOti2qsHJ', {
  host: 'dpg-cplimjo8fa8c73aa5q60-a',  // updated host
  dialect: 'postgres',
  port: 5432,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

export default db;
