import { Sequelize } from 'sequelize';
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';

export async function getAllUsers(req, res) {
  try {
    const users = await User.findAll();
    res.render('index_users', { users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function searchUsers(req, res) {
  const { query } = req.query;
  try {
    const users = await User.findAll({
      where: {
        [Sequelize.Op.or]: [
          { fullname: { [Sequelize.Op.iLike]: `%${query}%` } },
          { username: { [Sequelize.Op.iLike]: `%${query}%` } },
          { role: { [Sequelize.Op.iLike]: `%${query}%` } }
        ]
      }
    });
    res.render('index_users', { users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('view', { user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createUser(req, res) {
  const { fullname, username, password, role, speciality, medicalHistory } = req.body;
  try {
    const newUser = await User.create({ fullname, username, password, role });

    if (role === 'patient') {
      await Patient.create({ userId: newUser.id, medicalHistory });
    } else if (role === 'medic') {
      await Medic.create({ userId: newUser.id, speciality });
    }

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
    if (!user) {
      return res.status(404).send('User not found');
    }
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
    res.status (500).json({ message: error.message });
  }
}
