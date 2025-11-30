import { Router } from "express";
import { Op } from "sequelize";
import HealthCenter from '../models/healthCenter.js';
import Specialty from '../models/specialty.js';
import ScheduleSlot from '../models/scheduleSlot.js';
import { generateSlotsForDate, getAvailableDates, getAvailableSlots } from '../controllers/scheduleSlot.controllers.js';
import Medic from "../models/medic.js";
import Patient from "../models/patient.js";
import Availability from "../models/availability.js";
import User from "../models/user.js";
import Appointment from "../models/appointment.js";
const router = Router();


// Middleware simple para simular que el paciente está logueado
// (después tú reemplazas esto con tu login real)
router.use((req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  // Aquí extraemos al paciente real del usuario logueado
  req.patient = req.session.user.Patient;     // datos de paciente
  req.user = req.session.user;    

  next();
});

// PANEL PRINCIPAL DEL PACIENTE
router.get('/panel', async (req, res) => {
  const user = req.session.user;
  const patient = user.Patient;

  const healthCenter = await HealthCenter.findByPk(patient.healthCenterId);

  // Rango de fechas
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const dateStr = today.toISOString().split("T")[0];

  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 5);
  maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset());
  const maxDateStr = maxDate.toISOString().split("T")[0];

  console.log("\n==============================");
  console.log("🟦 PANEL PACIENTE");
  console.log("Paciente ID:", patient.id);
  console.log("Rango buscado:", dateStr, "→", maxDateStr);
  console.log("==============================");

  // BUSCAR FICHA ACTIVA EN EL RANGO
  const ficha = await ScheduleSlot.findOne({
    where: {
      patientId: patient.id,
      status: "booked",   // SOLO fichas activas
      date: {
        [Op.between]: [dateStr, maxDateStr]
      }
    },
    include: [{
      model: Availability,
      include: [
          {
            model: Medic,
            include: [
              { model: Specialty },
              { model: HealthCenter },
              { model: User }     // 🔥 ESTA LÍNEA ES LA QUE FALTABA
            ]
          }
      ]
    }]
  });

  console.log("➡ Resultado ficha:", ficha ? "ENCONTRADA" : "NO HAY");
  console.log("==============================");


  console.log("🟩 Resultado ficha:", ficha ? ficha.toJSON() : "NO HAY FICHA");
  console.log("==============================\n");

  res.render("patient/panel_paciente", {
    user,
    patient,
    healthCenter,
    ficha
  });
});

router.get("/nueva-ficha", async (req, res) => {
  const user = req.session.user;
  const paciente = await Patient.findByPk(user.Patient.id, {
    include: [{ model: HealthCenter }],
  });

  // traer médicos del mismo centro
  const medics = await Medic.findAll({
    where: { healthCenterId: paciente.healthCenterId },
    include: [{ model: Specialty }]
  });

  // especialidades únicas
  const specialties = [...new Map(
    medics.map(m => [m.specialtyId, m.Specialty])
  ).values()];

  // fechas disponibles desde el backend
  const dates = await getAvailableDates(paciente.healthCenterId);

  res.render("patient/nueva_ficha", {
    user,
    patient: paciente,
    healthCenter: paciente.HealthCenter,
    specialties,
    dates
  });
});


router.get("/horarios", async (req, res) => {
  const { date, specialtyId } = req.query;
  const paciente = req.session.user.Patient;

  console.log("\n---------------------------------");
  console.log("🟦 RUTA /horarios");
  console.log("date:", date);
  console.log("specialtyId:", specialtyId);
  console.log("healthCenterId:", paciente.healthCenterId);
  console.log("---------------------------------");

  await generateSlotsForDate(date);

  const slots = await getAvailableSlots(date, specialtyId, paciente.healthCenterId);

  console.log("Resultado final que envía al PUG:", slots);

  res.render("patient/horarios", {
    user: req.session.user,
    date,
    slots
  });
});

// Reservar un horario
router.get("/reservar/:slotId", async (req, res) => {
  const slot = await ScheduleSlot.findByPk(req.params.slotId, {
    include: [{ model: Availability }]
  });

  if (!slot) return res.send("Slot no encontrado.");

  const patientId = req.session.user.Patient.id;
  const availability = slot.Availability;

  // Obtener datos del médico
  const medic = await Medic.findByPk(availability.medicId, {
    include: [Specialty, HealthCenter, User]
  });

  if (!medic) return res.send("No se encontró al médico.");

  // Crear la cita (Appointment)
  const appointment = await Appointment.create({
    medicId: medic.id,
    patientId,
    healthCenterId: medic.healthCenterId,
    specialtyId: medic.specialtyId,
    date: slot.date,
    time: slot.time,
    type: "first",
    status: "pending",
    reason: "Consulta médica"
  });

  // Actualizar el ScheduleSlot
  slot.status = "booked";
  slot.patientId = patientId;
  slot.appointmentId = appointment.id;
  await slot.save();

  res.redirect("/patient/panel");
});




export default router;