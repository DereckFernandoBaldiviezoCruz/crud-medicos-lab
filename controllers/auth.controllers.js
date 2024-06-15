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

    // Envía una respuesta de éxito indicando el rol del usuario
    res.json({ role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
