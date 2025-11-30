// controllers/scheduleSlot.controllers.js
import ScheduleSlot from "../models/scheduleSlot.js";
import Availability from "../models/availability.js";
import Medic from "../models/medic.js";

// 🔵 Convierte HH:MM → minutos
const toMinutes = (str) => {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
};

/**
 * 🔥 Genera slots para UNA fecha dada
 */
export async function generateSlotsForDate(date) {
  console.log("🟦 Revisando si ya existen slots para:", date);

  // 1. Revisar si YA hay slots generados para esta fecha
  const existing = await ScheduleSlot.findOne({ where: { date } });

  if (existing) {
    console.log("🟩 Ya existen slots. NO se vuelve a generar.");
    return; // No volver a generar
  }

  console.log("🟨 No existen slots → generando...");

  const availabilities = await Availability.findAll({ where: { isActive: true } });

  for (let a of availabilities) {
    let start = toMinutes(a.startTime);
    let end = toMinutes(a.endTime);
    let duration = a.durationMinutes;

    while (start + duration <= end) {
      const hour = String(Math.floor(start / 60)).padStart(2, "0");
      const min = String(start % 60).padStart(2, "0");
      const time = `${hour}:${min}`;

      await ScheduleSlot.create({
        availabilityId: a.id,
        date,
        time,
        status: "available"
      });

      start += duration;
    }
  }

  console.log("🟩 Slots generados.");
}




/**
 * 🔥 Obtiene los slots disponibles para la especialidad y centro del paciente
 */
export async function getAvailableSlots(date, specialtyId, healthCenterId) {
  console.log("\n==============================");
  console.log("🟦 getAvailableSlots()");
  console.log("Fecha:", date);
  console.log("Especialidad ID:", specialtyId);
  console.log("Centro ID:", healthCenterId);
  console.log("==============================");

  // corregir día de semana
  const [y, m, d] = date.split("-").map(Number);
  const localDate = new Date(y, m - 1, d);
  const weekday = localDate.getDay();

  console.log("➡ Día corregido:", weekday);

  const availabilities = await Availability.findAll({
    where: {
      dayOfWeek: String(weekday),
      isActive: true,
      healthCenterId
    },
    include: [{
      model: Medic,
      where: { specialtyId }
    }]
  });

  console.log("🔵 Disponibilidades encontradas:", availabilities.length);

  const availabilityIds = availabilities.map(a => a.id);
  console.log("🟣 IDs de disponibilidades:", availabilityIds);

  if (availabilityIds.length === 0) {
    console.log("⛔ NO HAY DISPONIBILIDADES PARA ESTA ESPECIALIDAD EN ESTE CENTRO");
    return [];
  }

  const slots = await ScheduleSlot.findAll({
    where: { availabilityId: availabilityIds, date },
    order: [["time", "ASC"]]
  });

  console.log("🟢 Slots encontrados en BD:", slots.length);

  const result = slots.map(s => ({
    id: s.id,
    time: s.time,
    isAvailable: s.status === "available"
  }));

  console.log("🟢 Slots procesados:", result.length);

  return result;
}


/**
 * 🔥 Fechas disponibles (5 días siguientes)
 */
export const getAvailableDates = async () => {
  const today = new Date();
  const maxDays = 5;
  const dates = [];

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const dateStr = d.toISOString().split("T")[0];
    const weekday = d.getDay();

    const availabilities = await Availability.findAll({
      where: { dayOfWeek: String(weekday), isActive: true }
    });

    if (availabilities.length > 0) dates.push(dateStr);
  }

  return dates;
};
