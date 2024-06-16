import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  renderAppointmentForm,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controllers.js';

const router = Router();

router.get('/', getAllAppointments);
router.get('/new', renderAppointmentForm);  // Usa el controlador correcto
router.get('/:id', getAppointmentById);
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
