import User from '../models/user.js';

// Login de usuario
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username, password } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Redirecciona según el rol del usuario
    if (user.role === 'admin') {
      res.cookie('userId', user.id); // Establece la cookie 'userId' con el ID del usuario
      res.redirect('/admin');
    } else if (user.role === 'patient') {
      res.cookie('userId', user.id); // Establece la cookie 'userId' con el ID del usuario
      res.redirect('/patient');
    } else if (user.role === 'medic') {
      res.cookie('userId', user.id); // Establece la cookie 'userId' con el ID del usuario
      res.redirect('/medic');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
