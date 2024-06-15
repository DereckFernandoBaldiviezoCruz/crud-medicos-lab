// controllers/appointment.controllers.js
import  Appointment  from '../models/appointment.js';
import  Medic  from '../models/medic.js';
import  Patient  from '../models/patient.js';

export async function createAppointment(req, res) {
  const { date, time, medicId, patientId } = req.body;
  try {
    const { user } = req.session;

    // Si el usuario es paciente, usamos su ID
    const finalPatientId = user.role === 'patient' ? user.id : patientId;
    // Si el usuario es médico, usamos su ID
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

    let patients = [];
    let medics = [];

    // Obtener la lista de pacientes si el usuario es médico
    if (user.role === 'medic') {
      patients = await Patient.findAll({
        attributes: ['id'],
        include: [{ model: User, attributes: ['fullname'] }]
      });
    }

    // Obtener la lista de médicos con la información del usuario
    medics = await Medic.findAll({
      attributes: ['id', 'userId'],
      include: [{ model: User, attributes: ['fullname'] }]
    });

    res.render('appointment_form', { user, patients, medics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}