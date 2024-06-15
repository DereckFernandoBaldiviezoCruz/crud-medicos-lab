import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session'; // Importa express-session para manejar sesiones
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Importa las rutas de tu aplicación
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configura Sequelize para la conexión a PostgreSQL
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,       // Puedes cambiar por tu host de base de datos
  port: process.env.DB_PORT,       // Puedes cambiar por tu puerto de base de datos
  username: process.env.DB_USER,   // Puedes cambiar por tu usuario de base de datos
  password: process.env.DB_PASS,   // Puedes cambiar por tu contraseña de base de datos
  database: process.env.DB_NAME,   // Puedes cambiar por tu nombre de base de datos
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false   // Opciones adicionales para conexiones SSL
    }
  }
});

// Middleware para logs de peticiones
app.use(morgan('dev'));

// Middleware para procesar bodies JSON y URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para manejar sesiones con express-session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Establece el motor de vistas y la carpeta de vistas
app.set('view engine', 'pug');
app.set('views', './views');

// Rutas de la aplicación
app.use('/users', userRoutes);   // Rutas para usuarios
app.use('/auth', authRoutes);    // Rutas para autenticación

// Ruta para la página de inicio
app.get('/', (req, res) => {
  // Verifica el usuario autenticado y su rol
  const user = req.session.user;
  if (user) {
    if (user.role === 'admin') {
      // Redirige a la página de administrador si es admin
      res.redirect('/admin');
    } else if (user.role === 'patient') {
      // Redirige a la página de paciente si es paciente
      res.redirect('/patient');
    } else if (user.role === 'medic') {
      // Redirige a la página de médico si es médico
      res.redirect('/medic');
    }
  } else {
    // Redirige al login si no hay usuario autenticado
    res.redirect('/login');
  }
});

// Ruta para la página de login
app.get('/login', (req, res) => {
  // Renderiza la vista de login
  res.render('login');
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  // Destruye la sesión y redirige al login
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
    }
    res.redirect('/login');
  });
});

// Conexión a la base de datos y arranque del servidor
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');

    // Sincroniza los modelos con la base de datos (opcional, según tus necesidades)
     sequelize.sync();

    // Inicia el servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
