// routes/patient.routes.js
import { Router } from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patient.controllers.js';

const router = Router();

// GET todos los pacientes
router.get('/', getAllPatients);

// GET un paciente por ID
router.get('/:id', getPatientById);

// POST crear paciente
router.post('/', createPatient);

// PUT actualizar paciente
router.put('/:id', updatePatient);

// DELETE eliminar paciente
router.delete('/:id', deletePatient);

export default router;
