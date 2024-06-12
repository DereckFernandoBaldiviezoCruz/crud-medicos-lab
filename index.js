const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { sequelize } = require('./database/database.js');
const medicRoutes = require('./routes/medic.routes.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/medics', medicRoutes);

sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos: ', error);
  });
