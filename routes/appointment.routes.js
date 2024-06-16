import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  renderAppointmentForm,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controllers.js';
import Medic from '../models/medic.js';
import Patient from '../models/patient.js';
import User from '../models/user.js'; // Asegúrate de importar User

const router = Router();

router.get('/', getAllAppointments);

router.get('/new', async (req, res) => {
  const { user } = req.session; // Extrae el usuario de la sesión
  if (!user) {
    return res.redirect('/login'); // Redirige al login si no hay usuario en sesión
  }

  try {
    // Carga los datos necesarios según el rol del usuario
    let medics = [];
    let patients = [];

    if (user.role === 'patient') {
      // Si el usuario es un paciente, carga los médicos
      medics = await Medic.findAll({
        include: [{ model: User, attributes: ['fullname'] }],
      });
    } else if (user.role === 'medic') {
      // Si el usuario es un médico, carga los pacientes
      patients = await Patient.findAll({
        include: [{ model: User, attributes: ['fullname'] }],
      });
    }

    // Renderiza el formulario de citas con los datos del usuario en sesión y los datos cargados
    res.render('appointment_form', { user, medics, patients });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', getAppointmentById);
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
