// routes/appointment.routes.js
import { Router } from 'express';
import {
  createFirstAppointment,
  listAppointmentsByPatient,
  listAppointmentsByMedic,
} from '../controllers/appointment.controllers.js';

const router = Router();

router.post('/', createFirstAppointment);
router.get('/patient/:patientId', listAppointmentsByPatient);
router.get('/medic/:medicId', listAppointmentsByMedic);

export default router;
