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

// Opcionales (si luego quieres crear más controladores)
import userRoutes from './routes/user.routes.js';       // CRUD usuarios
import patientRoutes from './routes/patient.routes.js'; // CRUD pacientes (API)
import medicRoutes from './routes/medic.routes.js';     // CRUD/vistas médico
import patientPanelRoutes from './routes/patientPanel.routes.js'; // panel paciente

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

// Solo comprobar sesión
function requireLogin(req, res, next) {
  if (!req.session.user) {
    // ⬅ si no hay sesión → al login
    return res.redirect('/auth/login');
  }
  next();
}

// Comprobar sesión + rol permitido
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.session.user) {
      // ⬅ si no hay sesión → al login
      return res.redirect('/auth/login');
    }

    if (!rolesPermitidos.includes(req.session.user.role)) {
      // ⬅ hay sesión, pero rol incorrecto → página de no autorizado
      return res.status(403).render('errors/not_authorized', {
        user: req.session.user
      });
    }

    next();
  };
}

// =============================
// Configuración de vistas y estáticos
// =============================

// Usar fileURLToPath para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Motor de vistas PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// =============================
// Rutas base
// =============================

app.get('/', (req, res) => {
  return res.redirect('/auth/login');
});

// LOGIN (formulario)
app.get('/auth/login', (req, res) => {
  res.render('login');
});

// LOGOUT – destruir sesión
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
// Rutas principales del sistema
// =============================

// Login (API/controlador)
app.use('/auth', authRoutes);

// Panel del paciente SUS (solo rol "patient")
app.use('/patient', requireRole('patient'), patientPanelRoutes);

// Administración (solo rol "admin")
app.use('/admin', requireRole('admin'), adminRoutes);

// Citas (admin y médico)
app.use('/appointments', requireRole('admin', 'medic'), appointmentRoutes);

// Consultas médicas (solo médico)
app.use('/consultations', requireRole('medic'), consultationRoutes);

// Derivaciones (admin o médico)
app.use('/referrals', requireRole('admin', 'medic'), referralRoutes);

// CRUD de usuarios (solo admin)
app.use('/users', requireRole('admin'), userRoutes);

// CRUD de pacientes API (solo admin)
app.use('/patients', requireRole('admin'), patientRoutes);

// CRUD de médicos (solo admin)
app.use('/medics', requireRole('admin'), medicRoutes);

// Panel del médico (citas, consulta, receta) – solo médico
app.use('/medic', requireRole('medic'), medicRoutes);

// Disponibilidades (solo admin)
app.use('/availabilities', requireRole('admin'), availabilityRoutes);

// Slots de agenda (solo admin, si lo usas así)
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
