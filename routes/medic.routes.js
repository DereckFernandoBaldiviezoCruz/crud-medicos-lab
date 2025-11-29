import { Router } from "express";
import {
  medicDashboard,
  medicNoShow,
  medicAttend,
  saveConsultation,
  medicPrescriptionForm,
  savePrescription
} from "../controllers/medic.controllers.js";

const router = Router();

router.get("/", medicDashboard);

router.get("/slot/:id/attend", medicAttend);

router.get("/slot/:id/no_show", medicNoShow);

router.post("/consulta/:slotId", saveConsultation);

router.get("/receta/:slotId", medicPrescriptionForm);

router.post("/receta/:slotId", savePrescription);


export default router;
