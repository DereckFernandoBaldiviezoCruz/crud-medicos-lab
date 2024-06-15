import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import db from './database/database.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';  // Importa las rutas de autenticación
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/auth', authRoutes);  // Asigna el prefijo '/auth' a las rutas de autenticación

// Ruta para la página de inicio
app.get('/', (req, res) => {
  res.render('index');  // Renderiza la vista 'index.pug'
});

// Ruta para la página de login
app.get('/login', (req, res) => {
  res.render('login');  // Renderiza la vista 'login.pug'
});

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
    res.render('index_users', { users });  // Renderiza la vista 'index_users.pug' con los resultados de la búsqueda
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Conexión a la base de datos y arranque del servidor
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
