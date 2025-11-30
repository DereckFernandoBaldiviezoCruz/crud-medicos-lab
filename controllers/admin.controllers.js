// controllers/admin.controllers.js
import User from '../models/user.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';
import HealthCenter from '../models/healthCenter.js';
import Specialty from '../models/specialty.js';

// Crear usuario (admin / medic / patient)
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

    // OJO: por ahora guardamos password en texto plano (sin bcrypt), para pruebas
    const user = await User.create({ fullname, username, password, role });

    return res.redirect('/admin/users');
  } catch (err) {
    console.error('Error createUser:', err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// Crear centro de salud
export const createHealthCenter = async (req, res) => {
  try {
    const { name, level, address, city } = req.body;

    if (!name || !level) {
      return res.status(400).json({ message: 'Nombre y nivel son obligatorios' });
    }

    const center = await HealthCenter.create({
      name,
      level,
      address,
      city: city || 'Sucre',
    });

    return res.redirect('/admin/healthcenters');
  } catch (err) {
    console.error('Error createHealthCenter:', err);
    res.status(500).json({ message: 'Error al crear centro de salud' });
  }
};

// Crear especialidad
export const createSpecialty = async (req, res) => {
  try {
    const { name, isGeneral } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nombre de especialidad obligatorio' });
    }

    const existing = await Specialty.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'La especialidad ya existe' });
    }

    const specialty = await Specialty.create({
      name,
      isGeneral: !!isGeneral,
    });

    return res.redirect('/admin/specialties');
  } catch (err) {
    console.error('Error createSpecialty:', err);
    res.status(500).json({ message: 'Error al crear especialidad' });
  }
};

// Crear paciente (asociado a un usuario y a un centro de salud)
// Crear paciente + usuario automáticamente
export const registerPatient = async (req, res) => {
  try {
    const { fullname, ci, healthCenterId, medicalHistorySummary } = req.body;

    if (!fullname || !ci || !healthCenterId) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Verificar si ya existe usuario con ese CI
    const existing = await User.findOne({ where: { username: ci } });
    if (existing) {
      return res.status(400).json({ message: 'El CI ya está registrado como usuario' });
    }

    // Generar contraseña SUS única
    const susCode = 'SUS-' + Math.floor(100000 + Math.random() * 900000);

    // Crear usuario
    const user = await User.create({
      fullname,
      username: ci,
      password: susCode,
      role: 'patient'
    });

    // Crear paciente
    const patient = await Patient.create({
      userId: user.id,
      healthCenterId,
      medicalHistorySummary: medicalHistorySummary || null
    });

    return res.redirect('/admin/patients');

  } catch (err) {
    console.error('Error registerPatient:', err);
    res.status(500).json({ message: 'Error al registrar paciente' });
  }
};


// Crear médico (usuario ya debe existir con rol medic)
export const createMedic = async (req, res) => {
  try {
    const { userId, specialtyId, healthCenterId } = req.body;

    if (!userId || !specialtyId || !healthCenterId) {
      return res.status(400).json({ message: 'userId, specialtyId y healthCenterId son obligatorios' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role !== 'medic') {
      return res.status(400).json({ message: 'El usuario no tiene rol medic' });
    }

    const center = await HealthCenter.findByPk(healthCenterId);
    if (!center) return res.status(404).json({ message: 'Centro de salud no encontrado' });

    const specialty = await Specialty.findByPk(specialtyId);
    if (!specialty) return res.status(404).json({ message: 'Especialidad no encontrada' });

    const medic = await Medic.create({
      userId,
      specialtyId,
      healthCenterId,
    });

    return res.redirect('/admin/medic');
  } catch (err) {
    console.error('Error createMedic:', err);
    res.status(500).json({ message: 'Error al crear médico' });
  }
};
