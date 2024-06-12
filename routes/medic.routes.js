// medic.routes.js
import { Router } from 'express';
import {
  getMedics,
  createMedic,
  updateMedic,
  getMedic,
  deleteMedic,
  getMedicOffices,
} from '../controllers/medic.controllers.js'; // Asegúrate de que la ruta sea correcta aquí

const router = Router();

// Definir las rutas
router.post("/", createMedic);
router.get("/", getMedics);
router.put("/:id", updateMedic);
router.delete("/:id", deleteMedic);
router.get("/:id", getMedic);
router.get("/:id/offices", getMedicOffices);

export default router;
