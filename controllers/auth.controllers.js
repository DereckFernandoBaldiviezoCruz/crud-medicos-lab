// auth.controllers.js

import User from '../models/user.js';

// Login de usuario
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Guarda el usuario en la sesión
    req.session.user = user;

    // Redirecciona según el rol del usuario
    if (user.role === 'admin') {
      res.redirect('/admin'); // Redirige al dashboard de admin
    } else if (user.role === 'patient') {
      res.redirect('/patient'); // Redirige al dashboard de paciente
    } else if (user.role === 'medic') {
      res.redirect('/medic'); // Redirige al dashboard de médico
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
