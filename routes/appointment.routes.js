import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  renderAppointmentForm
} from '../controllers/appointment.controllers.js';

const router = Router();

router.get('/', getAllAppointments);
router.get('/new', renderAppointmentForm);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
