import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  renderAppointmentForm,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controllers.js';
import User from '../models/user.js'; // Asegúrate de importar User

const router = Router();

router.get('/', getAllAppointments);

router.get('/new', async (req, res) => {
  const { user } = req.session; // Extrae el usuario de la sesión
  if (!user) {
    return res.redirect('/login'); // Redirige al login si no hay usuario en sesión
  }
  try {
    // Renderiza el formulario de citas con la información del usuario en sesión
    res.render('appointment_form', { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/:id', getAppointmentById);
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
