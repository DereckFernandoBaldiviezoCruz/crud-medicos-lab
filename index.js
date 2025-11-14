// index.js
import express from 'express';
import dotenv from 'dotenv';
import db from './database/database.js';

import authRoutes from './routes/auth.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import consultationRoutes from './routes/consultation.routes.js';
import referralRoutes from './routes/referral.routes.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/consultations', consultationRoutes);
app.use('/referrals', referralRoutes);

// Sincronizar modelos
(async () => {
  try {
    await db.authenticate();
    console.log('DB conectada');
    await db.sync({ alter: true }); // cuidado en producción
    console.log('Modelos sincronizados');
  } catch (err) {
    console.error('Error al conectar DB', err);
  }
})();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
