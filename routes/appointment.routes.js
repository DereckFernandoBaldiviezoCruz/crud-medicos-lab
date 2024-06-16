import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controllers.js';
import Medic from '../models/medic.js';
import Patient from '../models/patient.js';
import User from '../models/user.js'; // Asegúrate de importar User

const router = Router();

router.get('/', getAllAppointments);

router.get('/new', async (req, res) => {
  try {
    // Cargar todos los médicos y pacientes
    const medics = await Medic.findAll({
      include: [{ model: User, attributes: ['fullname'] }],
    });
    const patients = await Patient.findAll({
      include: [{ model: User, attributes: ['fullname'] }],
    });

    // Renderizar el formulario de citas con los datos de médicos y pacientes
    res.render('appointment_form', { medics, patients });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', getAppointmentById);
router.post('/', createAppointment); // Asegúrate de que la ruta POST está definida correctamente
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
