import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import db from './database/database.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configura express-session con connect-pg-simple
const pgSessionStore = pgSession(session);

app.use(session({
  store: new pgSessionStore({
    conObject: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
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
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);

app.use(express.static('public'));

// Middleware para verificar la sesión del usuario
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Ruta principal
app.get('/', (req, res) => {
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
    res.redirect('/login');
  }
});

// Rutas específicas para cada rol
app.get('/admin', requireLogin, (req, res) => {
  res.render('index_admin');
});

app.get('/patient', requireLogin, (req, res) => {
  res.render('index_patient');
});

app.get('/medic', requireLogin, (req, res) => {
  res.render('index_medic');
});

app.get('/login', (req, res) => {
  res.render('login');
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
