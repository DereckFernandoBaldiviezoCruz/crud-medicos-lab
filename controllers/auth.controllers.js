// controllers/auth.controllers.js
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';
import HealthCenter from '../models/healthCenter.js';
import Specialty from '../models/specialty.js';

// Login sin bcrypt (comparación directa de contraseña)
// Úsalo solo de momento para probar el sistema.
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).render('login', { error: 'Credenciales inválidas' });
      // o: return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comparación simple de contraseña (SIN bcrypt, sólo para pruebas)
    if (user.password !== password) {
      return res.status(401).render('login', { error: 'Credenciales inválidas' });
    }

    // Traer info extra según el rol
    let patient = null;
    let medic = null;

    if (user.role === 'patient') {
      patient = await Patient.findOne({
        where: { userId: user.id },
        include: [HealthCenter]
      });
    }

    if (user.role === 'medic') {
      medic = await Medic.findOne({
        where: { userId: user.id },
        include: [Specialty, HealthCenter]
      });
    }

    // 🔥 Guardar todo lo importante en la sesión
    req.session.user = {
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      role: user.role,
      Patient: patient ? patient.toJSON() : null,
      Medic: medic ? medic.toJSON() : null
    };

    console.log('✅ Usuario logueado y guardado en sesión:', req.session.user);

    // Redirigir según rol
    if (user.role === 'admin') {
      return res.redirect('/admin');
    }

    if (user.role === 'medic') {
      return res.redirect('/medic');
    }

    if (user.role === 'patient') {
      return res.redirect('/patient/panel');
    }

    // Si por alguna razón tiene otro rol, lo mandamos al inicio
    return res.redirect('/');
  } catch (err) {
    console.error('Error en login:', err);
    // Puedes mostrar página de error o JSON
    return res.status(500).render('login', { error: 'Error interno en login' });
  }
};
