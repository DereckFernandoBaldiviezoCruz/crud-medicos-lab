// routes/scheduleSlot.routes.js
import { Router } from 'express';
import {
  createScheduleSlot,
  listSlotsByMedic,
  listSlotsByDate,
  updateSlotStatus,
} from '../controllers/scheduleSlot.controllers.js';

const router = Router();

router.post('/', createScheduleSlot);
router.get('/medic/:medicId', listSlotsByMedic);
router.get('/medic/:medicId/date/:date', listSlotsByDate);
router.put('/:id/status', updateSlotStatus);

export default router;
