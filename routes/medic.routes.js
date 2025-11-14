// routes/medic.routes.js
import { Router } from 'express';
import {
  getAllMedics,
  getMedicById,
} from '../controllers/medic.controllers.js';

const router = Router();

// GET /medics   → lista todos los médicos
router.get('/', getAllMedics);

// GET /medics/:id   → obtiene un médico por ID
router.get('/:id', getMedicById);



export default router;
