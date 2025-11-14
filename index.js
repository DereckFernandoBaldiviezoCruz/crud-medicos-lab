// index.js
import express from 'express';
import dotenv from 'dotenv';
import db from './database/database.js';

// Rutas
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import consultationRoutes from './routes/consultation.routes.js';
import referralRoutes from './routes/referral.routes.js';
import availabilityRoutes from './routes/availability.routes.js';
import scheduleSlotRoutes from './routes/scheduleSlot.routes.js';

// Opcionales (si luego quieres crear más controladores)
import userRoutes from './routes/user.routes.js';       // CRUD usuarios
import patientRoutes from './routes/patient.routes.js'; // CRUD pacientes
import medicRoutes from './routes/medic.routes.js';     // CRUD medicos

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----------------------------
// Ruta raíz para probar Render
// ----------------------------
app.get('/', (req, res) => {
  res.send('🩺 API SUS — Gestor de Citas funcionando correctamente ✔️');
});

// ----------------------------
// Rutas principales del sistema
// ----------------------------

// Login (usuarios del sistema)
app.use('/auth', authRoutes);

// Administración (crear usuarios, pacientes, médicos, centros, especialidades)
app.use('/admin', adminRoutes);

// Citas (crear y listar)
app.use('/appointments', appointmentRoutes);

// Consultas médicas (diagnóstico, notas, receta)
app.use('/consultations', consultationRoutes);

// Derivaciones entre centros/especialidades
app.use('/referrals', referralRoutes);

// CRUD de usuarios (opcional)
app.use('/users', userRoutes);

// CRUD de pacientes (opcional)
app.use('/patients', patientRoutes);

// CRUD de médicos (opcional)
app.use('/medics', medicRoutes);

// Disponibilidades y turnos
app.use('/availabilities', availabilityRoutes);
app.use('/scheduleslots', scheduleSlotRoutes);


// ----------------------------
// Sincronizar DB
// ----------------------------
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


// ----------------------------
// Iniciar servidor
// ----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✔ Servidor iniciado en puerto ${PORT}`);
});
