import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './database/database.js';
import userRoutes from './routes/user.routes.js';  // Asegúrate de importar las rutas de usuarios
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRoutes);  // Asígnale el prefijo '/users' a las rutas de usuarios

// Ruta para la búsqueda de usuarios
app.get('/users/search', async (req, res) => {
  const { query } = req.query;
  try {
    const users = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          { fullname: { [Sequelize.Op.iLike]: `%${query}%` } },
          { username: { [Sequelize.Op.iLike]: `%${query}%` } },
          { role: { [Sequelize.Op.iLike]: `%${query}%` } }
        ]
      }
    });
    res.render('index_users', { users });  // Renderiza la vista index_users con los resultados de la búsqueda
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

db.authenticate()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
