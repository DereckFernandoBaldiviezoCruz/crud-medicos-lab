const { Sequelize } = require('sequelize');

const db = new Sequelize('api_medic', 'dereck', 'mApgDMRQDO1xsd2TXof1rOOCOti2qsHJ', {
  host: 'internal-db',
  dialect: 'postgres',
  port: 5432,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

module.exports = db;