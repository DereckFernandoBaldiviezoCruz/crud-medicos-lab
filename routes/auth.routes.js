// routes/auth.routes.js
import { Router } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import User from '../models/user.js';
import Patient from '../models/patient.js'; // 👈 ASEGÚRATE DE IMPORTARLO
import { login } from '../controllers/auth.controllers.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// LOGIN REAL
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // ⬅️ AHORA INCLUÍMOS EL PACIENTE PARA TENER fullname, SEI, CI, etc.
    const user = await User.findOne({
      where: { username },
      include: [
        { model: Patient, as: 'Patient' } // 👈 TRÁEME EL PACIENTE ASOCIADO
      ]
    });

    console.log("Usuario logueado:", JSON.stringify(user, null, 2));

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Guardamos el usuario completo en sesión
    req.session.user = user;

    // Redirecciones según rol
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    if (user.role === 'patient') {
      return res.redirect('/patient/panel');
    }

    if (user.role === 'medic') {
      return res.redirect('/medic');
    }
    router.post('/login', login);

    // Si no coincide ningún rol
    return res.redirect('/auth/login');

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error interno en login' });
  }
});

export default router;
