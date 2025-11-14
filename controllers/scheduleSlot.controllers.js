// controllers/scheduleSlot.controllers.js
import ScheduleSlot from '../models/scheduleSlot.js';
import Availability from '../models/availability.js';
import Medic from '../models/medic.js';

export const createScheduleSlot = async (req, res) => {
  try {
    const { availabilityId, date, time } = req.body;

    const availability = await Availability.findByPk(availabilityId);
    if (!availability) return res.status(404).json({ message: 'Disponibilidad no encontrada' });

    const slot = await ScheduleSlot.create({ availabilityId, date, time });
    res.status(201).json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear turno' });
  }
};

export const listSlotsByMedic = async (req, res) => {
  try {
    const { medicId } = req.params;
    const availabilities = await Availability.findAll({ where: { medicId } });
    const availabilityIds = availabilities.map(a => a.id);

    const slots = await ScheduleSlot.findAll({ where: { availabilityId: availabilityIds }, order: [['date', 'ASC'], ['time', 'ASC']] });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar turnos' });
  }
};

export const listSlotsByDate = async (req, res) => {
  try {
    const { medicId, date } = req.params;
    const availabilities = await Availability.findAll({ where: { medicId } });
    const availabilityIds = availabilities.map(a => a.id);

    const slots = await ScheduleSlot.findAll({ where: { availabilityId: availabilityIds, date }, order: [['time', 'ASC']] });
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar turnos por fecha' });
  }
};

export const updateSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, patientId, appointmentId } = req.body;

    const slot = await ScheduleSlot.findByPk(id);
    if (!slot) return res.status(404).json({ message: 'Turno no encontrado' });

    await slot.update({ status, patientId, appointmentId });
    res.json(slot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar turno' });
  }
};
