// routes/admin.routes.js
import { Router } from 'express';
import {
  createUser,
  createHealthCenter,
  createSpecialty,
  createPatient,
  createMedic,
} from '../controllers/admin.controllers.js';

const router = Router();

// Usuarios
router.post('/users', createUser);

// Centros de salud
router.post('/health-centers', createHealthCenter);

// Especialidades
router.post('/specialties', createSpecialty);

// Pacientes
router.post('/patients', createPatient);

// Médicos
router.post('/medics', createMedic);

export default router;
