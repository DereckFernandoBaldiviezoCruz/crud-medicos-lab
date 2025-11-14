// routes/consultation.routes.js
import { Router } from 'express';
import { createConsultation } from '../controllers/consultation.controllers.js';

const router = Router();

router.post('/', createConsultation);

export default router;
