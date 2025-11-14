// routes/auth.routes.js
import { Router } from 'express';
import { fileURLToPath } from 'url';  // Necesario para convertir la URL a una ruta de archivo
import path from 'path';
import User from '../models/user.js';
import { login } from '../controllers/auth.controllers.js';

const router = Router();

// router.post('/login', login);
const __filename = fileURLToPath(import.meta.url);  // Obtener la URL del archivo actual
const __dirname = path.dirname(__filename); 

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const data = {
      id: user.id,
      fullname: user.fullname,
      role: user.role,
    };

   // Si es un paciente, redirigir a su dashboard
    if (user.role === 'patient') {
      return res.sendFile(path.join(__dirname, '../views/patient/dashboard.html'));  // Usar __dirname para referir la ruta correcta
    }

    // Si es un administrador, redirigir a su dashboard
    if (user.role === 'admin') {
      return res.sendFile(path.join(__dirname, '../views/admin/dashboard.html'));  // Usar __dirname para referir la ruta correcta
    }

    // Si el rol no es reconocido, redirigir al login o home
    return res.redirect('/auth/login');

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ message: 'Error interno en login' });
  }
});


export default router;
