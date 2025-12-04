// index.js
import express from 'express';
import dotenv from 'dotenv';
import db from './database/database.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import consultationRoutes from './routes/consultation.routes.js';
import referralRoutes from './routes/referral.routes.js';
import availabilityRoutes from './routes/availability.routes.js';
import scheduleSlotRoutes from './routes/scheduleSlot.routes.js';
import adminRoutes from './routes/admin.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import medicRoutes from './routes/medic.routes.js';
import patientPanelRoutes from './routes/patientPanel.routes.js';

import session from 'express-session';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "super-clave-sus",
  resave: false,
  saveUninitialized: false
}));

// =============================
// Middlewares de auth / roles
// =============================

// Solo comprobar sesión → si no hay, al login
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
}

// Comprobar sesión + rol permitido
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session.user) {
      // sin sesión → al login
      return res.redirect('/auth/login');
    }

    // con sesión pero rol incorrecto → 403 con vista
    if (!rolesPermitidos.includes(req.session.user.role)) {
      console.log('❌ Acceso denegado. Usuario en sesión:', req.session.user);

      // usamos callback en render por si falla la vista
      return res.status(403).render(
        'errors/not_authorized',
        { user: req.session.user },
        (err, html) => {
          if (err) {
            console.error('Error renderizando not_authorized:', err);
            // Fallback simple
            return res.status(403).send('No autorizado');
          }
          res.send(html);
        }
      );
    }

    next();
  };
}

// =============================
// Configuración de vistas y estáticos
// =============================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// =============================
// Rutas base
// =============================

app.get('/', (req, res) => {
  return res.redirect('/auth/login');
});

// Formulario de login
app.get('/auth/login', (req, res) => {
  res.render('login');
});

// Logout – destruir sesión
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/auth/login');
  });
});

// =============================
// Rutas protegidas
// =============================

// API login
app.use('/auth', authRoutes);

// Panel del paciente SUS (solo patient)
app.use('/patient', requireRole('patient'), patientPanelRoutes);

// Admin (solo admin)
app.use('/admin', requireRole('admin'), adminRoutes);

// Citas (admin y medic)
app.use('/appointments', requireRole('admin', 'medic'), appointmentRoutes);

// Consultas (solo medic)
app.use('/consultations', requireRole('medic'), consultationRoutes);

// Derivaciones (admin o medic)
app.use('/referrals', requireRole('admin', 'medic'), referralRoutes);

// CRUD usuarios (admin)
app.use('/users', requireRole('admin'), userRoutes);

// CRUD pacientes API (admin)
app.use('/patients', requireRole('admin'), patientRoutes);

// CRUD médicos (admin)
app.use('/medics', requireRole('admin'), medicRoutes);

// Panel del médico (solo medic)
app.use('/medic', requireRole('medic'), medicRoutes);

// Availabilities (admin)
app.use('/availabilities', requireRole('admin'), availabilityRoutes);

// Slots (admin)
app.use('/scheduleslots', requireRole('admin'), scheduleSlotRoutes);

// =============================
// Sincronizar DB
// =============================
(async () => {
  try {
    await db.authenticate();
    console.log('✔ Base de datos conectada');

    await db.sync({ alter: true });
    console.log('✔ Modelos sincronizados');
  } catch (err) {
    console.error('❌ Error al conectar la base de datos:', err);
  }
})();

// =============================
// Iniciar servidor
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✔ Servidor iniciado en puerto ${PORT}`);
});
