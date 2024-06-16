import Appointment from '../models/appointment.js';
import Medic from '../models/medic.js';
import Patient from '../models/patient.js';
import User from '../models/user.js';

export async function getAllAppointments(req, res) {
  try {
    const appointments = await Appointment.findAll();
    res.render('index_appointments', { appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getAppointmentById(req, res) {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id, {
      include: [
        { model: Medic, include: [{ model: User, attributes: ['fullname'] }] },
        { model: Patient, include: [{ model: User, attributes: ['fullname'] }] },
      ],
    });
    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }
    res.render('view_appointment', { appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createAppointment(req, res) {
  const { date, time, medicId, patientId } = req.body;
  try {
    const newAppointment = await Appointment.create({
      date,
      time,
      medicId,
      patientId,
    });

    res.redirect('/appointments');
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

    if (user.role === 'patient') {
      res.render('appointment_form', { user });
    } else if (user.role === 'medic') {
      const patients = await Patient.findAll({
        include: [{ model: User, attributes: ['fullname'] }],
      });
      res.render('appointment_form', { user, patients });
    } else {
      const medics = await Medic.findAll({
        include: [{ model: User, attributes: ['fullname'] }],
      });
      res.render('appointment_form', { user, medics });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateAppointment(req, res) {
  const { id } = req.params;
  const { date, time } = req.body;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).send('Appointment not found');
    }
    appointment.date = date;
    appointment.time = time;
    await appointment.save();
    res.redirect('/appointments');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function deleteAppointment(req, res) {
  const { id } = req.params;
  try {
    await Appointment.destroy({ where: { id } });
    res.redirect('/appointments');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
