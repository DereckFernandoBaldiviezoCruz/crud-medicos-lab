// index.js
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './database/database.js';
import medicRoutes from './routes/medic.routes.js';
import citasRoutes from './routes/cita.routes.js';
import userRoutes from './routes/user.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug'); // Configura Pug como el motor de plantillas
app.set('views', './views'); // Directorio de las vistas

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/medics', medicRoutes);
app.use('/citas', citasRoutes);
app.use('/users', userRoutes); // Usa las rutas de usuarios

db.authenticate()
  .then(() => {
    console.log('Database connected');
    return db.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a la base de datos: ', error);
  });
