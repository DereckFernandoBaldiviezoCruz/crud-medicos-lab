// controllers/auth.controllers.js
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    // OJO: si no usas bcrypt, reemplaza por comparación simple
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Credenciales inválidas' });

    // puedes guardar datos en sesión o devolver JWT
    const data = { id: user.id, fullname: user.fullname, role: user.role };

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      data.patientId = patient?.id;
    }
    if (user.role === 'medic') {
      const medic = await Medic.findOne({ where: { userId: user.id } });
      data.medicId = medic?.id;
    }

    return res.json({ user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en login' });
  }
};
