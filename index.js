import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import Sequelize from 'sequelize';
import db from './database/database.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/database.sqlite',
});

// Modelos
const User = sequelize.define('User', {
  fullname: Sequelize.STRING,
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  role: Sequelize.STRING,
});

// Sincronización de modelos con la base de datos
sequelize.sync().then(() => {
  console.log('Database synchronized');
}).catch(err => {
  console.error('Error synchronizing database:', err);
});

// Middleware para manejar el usuario actual
const getCurrentUser = async (req, res, next) => {
  const userId = req.cookies.userId;
  if (userId) {
    try {
      const currentUser = await User.findByPk(userId);
      req.currentUser = currentUser;
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }
  next();
};

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(getCurrentUser);

app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Ruta para la página de inicio
app.get('/', (req, res) => {
  const currentUser = req.currentUser;
  if (!currentUser) {
    res.redirect('/login'); // Redirecciona al login si no hay usuario logueado
    return;
  }

  let viewType = 'index';
  switch (currentUser.role) {
    case 'admin':
      viewType = 'index_admin';
      break;
    case 'patient':
      viewType = 'index_patient';
      break;
    case 'medic':
      viewType = 'index_medic';
      break;
    default:
      viewType = 'index';
      break;
  }

  res.render(viewType, { currentUser });
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
    const currentUser = req.currentUser;
    res.render('index_users', { users, currentUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para la página de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Ruta para el proceso de login
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Almacenar el ID de usuario en una cookie
    res.cookie('userId', user.id);
    res.redirect('/'); // Redirigir a la página de inicio
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  res.clearCookie('userId'); // Borrar la cookie de usuario
  res.redirect('/login'); // Redirigir al login
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
