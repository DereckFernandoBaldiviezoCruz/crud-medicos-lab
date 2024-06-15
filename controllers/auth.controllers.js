import User from '../models/user.js';
import Patient from '../models/patient.js'; // Importa el modelo de paciente si existe
import Medic from '../models/medic.js';     // Importa el modelo de médico si existe

// Registro de usuario
export const register = async (req, res) => {
  const { fullname, username, password, role, speciality, medicalHistory } = req.body;
  try {
    const newUser = await User.create({ fullname, username, password, role });

    // Si el rol es 'patient', crea una instancia de paciente
    if (role === 'patient') {
      await Patient.create({ userId: newUser.id, medicalHistory });
    } 
    // Si el rol es 'medic', crea una instancia de médico
    else if (role === 'medic') {
      await Medic.create({ userId: newUser.id, speciality });
    }

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Autenticación simple usando un token o identificador
    const token = 'token_generado'; // Puedes generar un token aquí
    res.cookie('token', token, { httpOnly: true }); // Almacenar el token en una cookie

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
