// routes/availability.routes.js
import { Router } from 'express';
import {
  createAvailability,
  listAvailabilitiesByMedic,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availability.controllers.js';

const router = Router();

router.post('/', createAvailability);
router.get('/medic/:medicId', listAvailabilitiesByMedic);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

export default router;
