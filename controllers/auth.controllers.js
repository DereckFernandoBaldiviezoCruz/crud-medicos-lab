// controllers/auth.controllers.js
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';

// Login sin bcrypt (comparación directa de contraseña)
// Úsalo solo de momento para probar el sistema.
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comparación simple de contraseña (SIN bcrypt, sólo para pruebas)
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Armar respuesta básica
    const data = {
      id: user.id,
      fullname: user.fullname,
      role: user.role,
    };

    // Si es paciente, adjuntar patientId
    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (patient) data.patientId = patient.id;
    }

    // Si es médico, adjuntar medicId
    if (user.role === 'medic') {
      const medic = await Medic.findOne({ where: { userId: user.id } });
      if (medic) data.medicId = medic.id;
    }

    return res.json({ user: data });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno en login' });
  }
};
