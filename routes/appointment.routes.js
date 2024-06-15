// routes/appointment.routes.js
import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointment.controllers.js';

const router = Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/new', (req, res) => {
  res.render('appointment_form'); // Renderiza el formulario de creación de cita
});
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
