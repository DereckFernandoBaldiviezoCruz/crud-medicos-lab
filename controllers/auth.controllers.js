import User from '../models/user.js';

// Registro de usuario
export const register = async (req, res) => {
  const { fullname, username, password, role, speciality, medicalHistory } = req.body;
  try {
    const newUser = await User.create({ fullname, username, password, role });

    if (role === 'patient') {
      await Patient.create({ userId: newUser.id, medicalHistory });
    } else if (role === 'medic') {
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

    // Autenticación simple usando sesiones
    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Middleware de autenticación
export const authenticate = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  next();
};
