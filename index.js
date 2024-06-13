import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './database/database.js'; // Importación corregida
import medicRoutes from './routes/medic.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/medics', medicRoutes);

db.authenticate()
  .then(() => {
    console.log('Database connected');

    // Sincronizar los modelos
    return db.sync({ force: false }); // Cambia esto a true si quieres forzar la recreación de tablas
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos: ', error);
  });
