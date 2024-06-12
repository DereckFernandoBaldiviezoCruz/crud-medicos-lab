import { Router } from 'express';
import {
  getMedics,
  createMedic,
  updateMedic,
  getMedic,
  deleteMedic,
  getMedicOffices,
} from '../controllers/medic.controller.js';

const router = Router();

// Definir las rutas
router.post("/", createMedic);
router.get("/", getMedics);
router.put("/:id", updateMedic);
router.delete("/:id", deleteMedic);
router.get("/:id", getMedic);
router.get("/:id/offices", getMedicOffices);

export default router;
