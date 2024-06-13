// controllers/user.controllers.js
import User from '../models/user.js';

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll();
    res.render('index_users', { users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    res.render('view', { user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createUser(req, res) {
  const { fullname, username, password, role } = req.body;
  try {
    const newUser = await User.create({ fullname, username, password, role });
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateUser(req, res) {
  const { id } = req.params;
  const { fullname, username, password, role } = req.body;
  try {
    const user = await User.findByPk(id);
    user.fullname = fullname;
    user.username = username;
    user.password = password;
    user.role = role;
    await user.save();
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    await User.destroy({ where: { id } });
    res.redirect('/users');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
