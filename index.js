import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import db from './database/database.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js'; // Importa las rutas de autenticación
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configura express-session
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/auth', authRoutes); // Asigna el prefijo '/auth' a las rutas de autenticación

// Middleware para verificar la sesión del usuario
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirige al login si no hay sesión de usuario
  }
  next();
};

// Ruta principal
app.get('/', (req, res) => {
  // Renderiza el index.pug con las opciones según el rol del usuario
  const { user } = req.session;
  if (user) {
    if (user.role === 'admin') {
      res.redirect('/admin');
    } else if (user.role === 'patient') {
      res.redirect('/patient');
    } else if (user.role === 'medic') {
      res.redirect('/medic');
    }
  } else {
    res.redirect('/login'); // Si no está autenticado, redirige al login
  }
});

// Rutas para roles específicos

// Ruta para el administrador
app.get('/admin', requireLogin, (req, res) => {
  // Aquí renderiza el index_admin.pug o una vista similar para el administrador
  res.render('index_admin');
});

// Ruta para el paciente
app.get('/patient', requireLogin, (req, res) => {
  // Aquí renderiza el index_patient.pug o una vista similar para el paciente
  res.render('index_patient');
});

// Ruta para el médico
app.get('/medic', requireLogin, (req, res) => {
  // Aquí renderiza el index_medic.pug o una vista similar para el médico
  res.render('index_medic');
});

// Ruta para el login
app.get('/login', (req, res) => {
  res.render('login'); // Renderiza la vista de login
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
