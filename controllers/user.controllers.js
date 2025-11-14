// controllers/user.controllers.js
import User from '../models/user.js';

// Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullname', 'username', 'role', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (err) {
    console.error('Error getAllUsers:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ['id', 'fullname', 'username', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (err) {
    console.error('Error getUserById:', err);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

// Crear usuario (similar a /admin/users, pero más genérico)
export const createUser = async (req, res) => {
  try {
    const { fullname, username, password, role } = req.body;

    if (!fullname || !username || !password || !role) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    if (!['admin', 'medic', 'patient'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'El username ya existe' });
    }

    // OJO: por ahora sin bcrypt, solo para pruebas
    const user = await User.create({ fullname, username, password, role });
    res.status(201).json(user);
  } catch (err) {
    console.error('Error createUser:', err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullname, password, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (fullname !== undefined) user.fullname = fullname;
    if (password !== undefined) user.password = password; // sin hash, prueba
    if (role !== undefined) {
      if (!['admin', 'medic', 'patient'].includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }
      user.role = role;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error updateUser:', err);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error deleteUser:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};
