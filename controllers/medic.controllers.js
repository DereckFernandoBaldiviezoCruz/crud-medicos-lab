// controllers/medic.controllers.js
import Medic from "../models/medic.js";
import ScheduleSlot from "../models/scheduleSlot.js";
import Availability from "../models/availability.js";
import Patient from "../models/patient.js";
import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Specialty from "../models/specialty.js";
import HealthCenter from "../models/healthCenter.js";
import Consultation from "../models/consultation.js";
import Prescription from "../models/prescription.js";

function nextDateForDay(weekday, start = new Date()) {
  const date = new Date(start);
  const diff = (weekday + 7 - date.getDay()) % 7;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export const medicDashboard = async (req, res) => {
  console.log("Session:", req.session);

  const userId = req.session.user?.id;

  if (!userId) {
    return res.send("No hay sesión o no eres médico.");
  }

  const medic = await Medic.findOne({
    where: { userId },
    include: [User, Specialty, HealthCenter]
  });

  if (!medic) {
    return res.send("Este usuario no está registrado como médico.");
  }

  // 1. OBTENER DIAS DE LA SEMANA DONDE EL MÉDICO TRABAJA
  const availabilities = await Availability.findAll({
    where: { medicId: medic.id }
  });

  if (availabilities.length === 0) {
    return res.send("No tienes horarios configurados.");
  }

  const workingDays = availabilities
    .map(a => Number(a.dayOfWeek))
    .sort((a, b) => a - b);

  // 2. BUSCAR EL PRIMER DÍA QUE TENGA CITAS
  let foundSlots = null;
  let chosenDate = null;

  for (let day of workingDays) {
    const date = nextDateForDay(day);

    const slots = await ScheduleSlot.findAll({
      where: { date, status: "booked" },
      include: [
        { model: Availability, where: { medicId: medic.id } },
        { model: Patient, include: [{ model: User, as: "User" }] },
        {
          model: Appointment,
          required: false,
          attributes: ["id", "reason", "type", "status", "date", "time"]
        }
      ],
      order: [["time", "ASC"]]
    });

    console.log("🟦 Slots enviados al panel del médico:");
    slots.forEach(s => {
      console.log({
        id: s.id,
        time: s.time,
        status: s.status,
        patientId: s.patientId,
        appointmentId: s.appointmentId,
        hasAppointment: !!s.Appointment
      });
    });

    console.log("🟪 DEBUG APPOINTMENTS:");
    slots.forEach(s => {
      console.log({
        slotId: s.id,
        appointmentId: s.appointmentId,
        appointment: s.Appointment ? s.Appointment.toJSON() : null
      });
    });

    if (slots.length > 0) {
      foundSlots = slots;
      chosenDate = date;
      break; // detener al encontrar la primera fecha con citas
    }
  }

  // Si ningún día tiene citas, igual mostrar la próxima fecha disponible aunque esté vacía
  if (!foundSlots) {
    chosenDate = nextDateForDay(workingDays[0]);
    foundSlots = [];
  }

  res.render("medic/dashboard", {
    slots: foundSlots,
    medic,
    dateStr: chosenDate
  });
};

// marcar como no show
export const medicNoShow = async (req, res) => {
  const slotId = req.params.id;

  const slot = await ScheduleSlot.findByPk(slotId, {
    include: [Appointment]
  });

  if (!slot || !slot.Appointment) return res.send("No existe la cita.");

  await slot.Appointment.update({ status: "no_show" });

  res.redirect("/medic");
};

// atender (abrir formulario + historial)
export const medicAttend = async (req, res) => {
  const slotId = req.params.id;

  const slot = await ScheduleSlot.findByPk(slotId, {
    include: [
      {
        model: Appointment,
        include: [
          { model: Patient, include: [{ model: User, as: "User" }] },
          { model: Medic, include: [User, Specialty, HealthCenter] }
        ]
      },
      {
        model: Patient,
        include: [{ model: User, as: "User" }]
      }
    ]
  });

  if (!slot) return res.send("Cita no encontrada.");

  console.log("🟦 CONSULTANDO SLOT PARA ATENDER:");
  console.log(JSON.stringify(slot, null, 2));

  // Paciente asociado (preferimos slot.Patient, pero si no, desde Appointment)
  const patient = slot.Patient || slot.Appointment?.Patient;
  if (!patient) {
    return res.send("No se encontró el paciente asociado a la cita.");
  }

  // 🔥 Consultas previas de este paciente
  const consultasPrevias = await Consultation.findAll({
    where: { patientId: patient.id },
    include: [
      {
        model: Medic,
        include: [User]
      },
      {
        model: Appointment
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  // 🔥 Recetas previas de este paciente
  const recetasPrevias = await Prescription.findAll({
    where: { patientId: patient.id },
    include: [
      {
        model: Medic,
        include: [User]
      },
      {
        model: Consultation
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  res.render("medic/consulta_form", {
    slot,
    appointment: slot.Appointment,
    patient,
    medic: slot.Appointment?.Medic,
    consultasPrevias,
    recetasPrevias
  });
};

export const saveConsultation = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const { reason, symptoms, diagnosis, notes } = req.body;

    const slot = await ScheduleSlot.findByPk(slotId, {
      include: [Appointment]
    });

    if (!slot || !slot.Appointment) {
      return res.send("No se encontró la cita asociada al horario.");
    }

    const ap = slot.Appointment;

    // Actualizar motivo y estado en Appointment
    ap.reason = reason;
    ap.status = "attended";
    await ap.save();

    // Crear la consulta con todos los campos (usa los nuevos campos del modelo)
    await Consultation.create({
      appointmentId: ap.id,
      medicId: ap.medicId,
      patientId: ap.patientId,
      reason,
      symptoms,
      diagnosis,
      notes
    });

    res.render("medic/consulta_guardada", {
      slotId,
      appointment: ap
    });
  } catch (err) {
    console.error(err);
    res.send("Error guardando consulta");
  }
};

export const medicPrescriptionForm = async (req, res) => {
  const slotId = req.params.slotId;

  const slot = await ScheduleSlot.findByPk(slotId, {
    include: [
      {
        model: Appointment,
        include: [
          {
            model: Patient,
            include: [{ model: User, as: "User" }]
          },
          {
            model: Medic,
            include: [{ model: User, as: "User" }]
          }
        ]
      },
      {
        model: Patient,
        include: [{ model: User, as: "User" }]
      }
    ]
  });

  if (!slot || !slot.Appointment) {
    return res.send("No se encuentra la consulta previa.");
  }

  const consultation = await Consultation.findOne({
    where: { appointmentId: slot.Appointment.id }
  });

  res.render("medic/receta_form", {
    slot,
    appointment: slot.Appointment,
    consultation
  });
};

export const savePrescription = async (req, res) => {
  try {
    const slotId = req.params.slotId;
    const { content } = req.body;

    const slot = await ScheduleSlot.findByPk(slotId, {
      include: [Appointment]
    });

    if (!slot || !slot.Appointment) {
      return res.send("No se encontró la cita asociada al horario.");
    }

    const ap = slot.Appointment;

    const consultation = await Consultation.findOne({
      where: { appointmentId: ap.id }
    });

    if (!consultation) {
      return res.send("Debe registrar primero la consulta antes de emitir una receta.");
    }

    await Prescription.create({
      consultationId: consultation.id,
      medicId: ap.medicId,
      patientId: ap.patientId,
      healthCenterId: ap.healthCenterId,
      date: ap.date,
      content
    });

    res.redirect("/medic");
  } catch (err) {
    console.error(err);
    res.send("Error guardando receta");
  }
};
