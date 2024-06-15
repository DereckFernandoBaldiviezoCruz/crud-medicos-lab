// controllers/appointment.controllers.js
import  Appointment  from '../models/appointment.js';
import  Medic  from '../models/medic.js';
import  Patient  from '../models/patient.js';
import User from '../models/user.js';

export async function createAppointment(req, res) {
  const { date, time, medicId, patientId } = req.body;
  try {
    const { user } = req.session;

    // Determinar los IDs de médico y paciente según el rol del usuario
    const finalPatientId = user.role === 'patient' ? user.id : patientId;
    const finalMedicId = user.role === 'medic' ? user.id : medicId;

    const newAppointment = await Appointment.create({
      date,
      time,
      medicId: finalMedicId,
      patientId: finalPatientId,
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
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

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
export async function renderAppointmentForm(req, res) {
  try {
    const { user } = req.session;

    if (!user) {
      return res.redirect('/login');
    }

    // Obtener la lista de médicos y pacientes
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['fullname'] }]
    });

    const medics = await Medic.findAll({
      include: [{ model: User, attributes: ['fullname'] }]
    });

    res.render('appointment_form', { user, patients, medics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}