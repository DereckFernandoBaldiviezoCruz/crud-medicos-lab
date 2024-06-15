// controllers/appointment.controllers.js
import { Appointment } from '../models/cita.js';
import { Medic } from '../models/medic.js';
import { Patient } from '../models/patient.js';

export async function createAppointment(req, res) {
  const { date, time, medicId, patientId } = req.body;
  try {
    const newAppointment = await Appointment.create({
      date,
      time,
      medicId,
      patientId,
    });
    res.json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAppointments(req, res) {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: Medic, attributes: ['name', 'speciality'] },
        { model: Patient, attributes: ['name', 'phone'] },
      ],
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAppointment(req, res) {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findOne({
      where: { id },
      include: [
        { model: Medic, attributes: ['name', 'speciality'] },
        { model: Patient, attributes: ['name', 'phone'] },
      ],
    });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateAppointment(req, res) {
  const { id } = req.params;
  const { date, time, status } = req.body;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.date = date;
    appointment.time = time;
    appointment.status = status;
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteAppointment(req, res) {
  const { id } = req.params;
  try {
    await Appointment.destroy({ where: { id } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
