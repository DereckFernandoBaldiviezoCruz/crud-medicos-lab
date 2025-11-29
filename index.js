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
import adminRoutes from './routes/admin.routes.js'; // 👈 NUEVA
import path from 'path'; 
import { fileURLToPath } from 'url'; 

// Opcionales (si luego quieres crear más controladores)
import userRoutes from './routes/user.routes.js';       // CRUD usuarios
import patientRoutes from './routes/patient.routes.js'; // CRUD pacientes
import medicRoutes from './routes/medic.routes.js';     // CRUD medicos
import patientPanelRoutes from './routes/patientPanel.routes.js'; //panel paciente
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


// Usar fileURLToPath para obtener __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar el motor de vistas PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Configura la carpeta pública para servir archivos estáticos (si tienes imágenes o CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz para probar
// ----------------------------
// Ruta raíz para probar Render
// ----------------------------
app.get('/', (req, res) => {
  res.send('🩺 API SUS — Gestor de Citas funcionando correctamente ✔️');
});

//LOGIN
app.get('/auth/login', (req, res) => {
  res.render('login'); // 👈 AHORA SÍ RENDERIZA PUG
});
//END LOGIN
// Ruta de logout
app.get('/logout', (req, res) => {
  // Aquí puedes limpiar la sesión o el token (si usas JWT)
  res.redirect('/auth/login');  // Redirigir al formulario de login
});
// END LOGOUT

// Rutas
// ----------------------------
// Rutas principales del sistema
// ----------------------------

// Login (usuarios del sistema)
app.use('/auth', authRoutes);

app.use('/patient', patientPanelRoutes);

// Administración (crear usuarios, pacientes, médicos, centros, especialidades)
app.use('/admin', adminRoutes);

// Citas (crear y listar)
app.use('/appointments', appointmentRoutes);

// Consultas médicas (diagnóstico, notas, receta)
app.use('/consultations', consultationRoutes);

// Derivaciones entre centros/especialidades
app.use('/referrals', referralRoutes);


// Conexión y sync
// CRUD de usuarios (opcional)
app.use('/users', userRoutes);

// CRUD de pacientes (opcional)
app.use('/patients', patientRoutes);

// CRUD de médicos (opcional)
app.use('/medics', medicRoutes);//crud de medicos desde el panel de admin

// Panel del médico (citas, consulta, no show)
app.use('/medic', medicRoutes); //vistas del medico


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
