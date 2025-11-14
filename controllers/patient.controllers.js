// controllers/patient.controllers.js
import Patient from '../models/patient.js';
import User from '../models/user.js';
import HealthCenter from '../models/healthCenter.js';

// Listar todos los pacientes
export const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        { model: User, attributes: ['id', 'fullname', 'username'] },
        { model: HealthCenter, attributes: ['id', 'name', 'level'] }
      ]
    });

    res.json(patients);
  } catch (err) {
    console.error('Error getAllPatients:', err);
    res.status(500).json({ message: 'Error al obtener pacientes' });
  }
};

// Obtener un paciente por ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'fullname', 'username'] },
        { model: HealthCenter, attributes: ['id', 'name', 'level'] }
      ]
    });

    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    res.json(patient);
  } catch (err) {
    console.error('Error getPatientById:', err);
    res.status(500).json({ message: 'Error al obtener paciente' });
  }
};

// Crear paciente normal (ya existe /admin/patients, pero lo incluyo por completo)
export const createPatient = async (req, res) => {
  try {
    const { userId, healthCenterId, medicalHistorySummary } = req.body;

    if (!userId || !healthCenterId) {
      return res.status(400).json({ message: 'userId y healthCenterId son obligatorios' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    if (user.role !== 'patient') {
      return res.status(400).json({ message: 'El usuario no tiene rol patient' });
    }

    const center = await HealthCenter.findByPk(healthCenterId);
    if (!center) return res.status(404).json({ message: 'Centro de salud no encontrado' });

    const patient = await Patient.create({
      userId,
      healthCenterId,
      medicalHistorySummary: medicalHistorySummary || null,
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error('Error createPatient:', err);
    res.status(500).json({ message: 'Error al crear paciente' });
  }
};

// Actualizar paciente
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { healthCenterId, medicalHistorySummary } = req.body;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    if (healthCenterId) {
      const center = await HealthCenter.findByPk(healthCenterId);
      if (!center) return res.status(404).json({ message: 'Centro de salud no encontrado' });
      patient.healthCenterId = healthCenterId;
    }

    if (medicalHistorySummary !== undefined) {
      patient.medicalHistorySummary = medicalHistorySummary;
    }

    await patient.save();

    res.json(patient);
  } catch (err) {
    console.error('Error updatePatient:', err);
    res.status(500).json({ message: 'Error al actualizar paciente' });
  }
};

// Eliminar paciente
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    await patient.destroy();

    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (err) {
    console.error('Error deletePatient:', err);
    res.status(500).json({ message: 'Error al eliminar paciente' });
  }
};
