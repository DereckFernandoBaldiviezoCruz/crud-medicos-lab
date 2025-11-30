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
 * 🔥 Genera slots para UNA fecha dada (YYYY-MM-DD)
 * - Solo genera para las disponibilidades cuyo dayOfWeek coincide con la fecha
 * - Salta sábados y domingos
 * - No regenera si ya hay slots para esa fecha
 */
export async function generateSlotsForDate(dateStr) {
  console.log("🟦 Revisando si ya existen slots para:", dateStr);

  // 0. Calcular día de la semana de esa fecha
  const [y, m, d] = dateStr.split("-").map(Number);
  const jsDate = new Date(y, m - 1, d);
  const weekday = jsDate.getDay(); // 0=Dom,1=Lun,...,6=Sáb

  // Saltar fines de semana
  if (weekday === 0 || weekday === 6) {
    console.log("⛔ Fin de semana, no se generan slots para", dateStr);
    return;
  }

  // 1. Revisar si YA hay slots generados para esta fecha
  const existing = await ScheduleSlot.findOne({ where: { date: dateStr } });

  if (existing) {
    console.log("🟩 Ya existen slots. NO se vuelve a generar.");
    return; // No volver a generar
  }

  console.log("🟨 No existen slots → generando...");

  // 2. Buscar SOLO disponibilidades activas que coincidan con el día de la semana
  const availabilities = await Availability.findAll({
    where: {
      isActive: true,
      dayOfWeek: String(weekday) // '1'..'5'
    }
  });

  console.log("🔵 Availabilities encontradas para weekday", weekday, ":", availabilities.length);

  if (!availabilities.length) {
    console.log("⛔ No hay disponibilidades para este día:", dateStr);
    return;
  }

  // 3. Generar los slots para cada disponibilidad
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
        date: dateStr,
        time,
        status: "available" // disponible; luego pasa a "booked"
      });

      start += duration;
    }
  }

  console.log("🟩 Slots generados para", dateStr);
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
 * 🔥 Fechas disponibles (próximos N días),
 *    filtradas por centro de salud y Availability activa
 */
export const getAvailableDates = async (healthCenterId, maxDays = 5) => {
  const today = new Date();
  const dates = [];

  for (let i = 0; i < maxDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const weekday = d.getDay(); // 0=Dom..6=Sáb

    // Saltar sábados y domingos
    if (weekday === 0 || weekday === 6) continue;

    const dateStr = d.toISOString().split("T")[0];

    const availabilities = await Availability.findAll({
      where: {
        dayOfWeek: String(weekday),
        isActive: true,
        ...(healthCenterId ? { healthCenterId } : {})
      }
    });

    if (availabilities.length > 0) {
      dates.push(dateStr);
    }
  }

  return dates;
};

/**
 * 🔥 (Opcional) Generar slots para varios días:
 *    fromDateStr: 'YYYY-MM-DD'
 *    days: cuántos días hacia adelante generar
 */
export async function generateSlotsForRange(fromDateStr, days = 7) {
  const [y, m, d] = fromDateStr.split("-").map(Number);
  const start = new Date(y, m - 1, d);

  for (let i = 0; i < days; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = current.toISOString().slice(0, 10);
    await generateSlotsForDate(dateStr);
  }
}
