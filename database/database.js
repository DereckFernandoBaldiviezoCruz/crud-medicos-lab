// database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Ejemplo:
// postgres://user:pass@host:5432/dbname
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Falta la variable DATABASE_URL');
}

const db = new Sequelize(connectionString, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // necesario en muchos hostings
    },
  },
});

export default db;
