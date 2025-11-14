// controllers/appointment.controllers.js
import Appointment from '../models/appointment.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';
import Specialty from '../models/specialty.js';
import Consultation from '../models/consultation.js';

export const createFirstAppointment = async (req, res) => {
  try {
    const { patientId } = req.body; // o desde sesión
    const { date, time, reason } = req.body;

    const patient = await Patient.findByPk(patientId);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });

    // buscar especialidad general
    const generalSpecialty = await Specialty.findOne({ where: { isGeneral: true } });
    if (!generalSpecialty) {
      return res.status(500).json({ message: 'No existe especialidad de medicina general configurada' });
    }

    // médico general en el centro del paciente (escogemos cualquiera disponible por ahora)
    const medicGeneral = await Medic.findOne({
      where: {
        healthCenterId: patient.healthCenterId,
        specialtyId: generalSpecialty.id,
      },
    });

    if (!medicGeneral) {
      return res.status(400).json({ message: 'No hay médico general asignado a su centro de salud' });
    }

    const appointment = await Appointment.create({
      patientId: patient.id,
      medicId: medicGeneral.id,
      healthCenterId: patient.healthCenterId,
      specialtyId: generalSpecialty.id,
      date,
      time,
      type: 'first',
      status: 'pending',
      reason,
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear cita' });
  }
};

export const listAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.findAll({
      where: { patientId },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar citas' });
  }
};

export const listAppointmentsByMedic = async (req, res) => {
  try {
    const { medicId } = req.params;
    const appointments = await Appointment.findAll({
      where: { medicId },
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar citas del médico' });
  }
};
