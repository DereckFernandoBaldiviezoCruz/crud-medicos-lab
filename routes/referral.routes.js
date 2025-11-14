// routes/referral.routes.js
import { Router } from 'express';
import {
  createReferral,
  listReferralsByPatient,
} from '../controllers/referral.controllers.js';

const router = Router();

router.post('/', createReferral);
router.get('/patient/:patientId', listReferralsByPatient);

export default router;
