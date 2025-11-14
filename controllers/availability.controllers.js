// controllers/availability.controllers.js
import Availability from '../models/availability.js';
import Medic from '../models/medic.js';
import HealthCenter from '../models/healthCenter.js';

export const createAvailability = async (req, res) => {
  try {
    const { medicId, healthCenterId, dayOfWeek, startTime, endTime, isActive } = req.body;

    const medic = await Medic.findByPk(medicId);
    if (!medic) return res.status(404).json({ message: 'Médico no encontrado' });

    const healthCenter = await HealthCenter.findByPk(healthCenterId);
    if (!healthCenter) return res.status(404).json({ message: 'Centro de salud no encontrado' });

    const availability = await Availability.create({
      medicId,
      healthCenterId,
      dayOfWeek: String(dayOfWeek),
      startTime,
      endTime,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear disponibilidad' });
  }
};

export const listAvailabilitiesByMedic = async (req, res) => {
  try {
    const { medicId } = req.params;
    const availabilities = await Availability.findAll({ where: { medicId }, order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']] });
    res.json(availabilities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al listar disponibilidades' });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await Availability.findByPk(id);
    if (!availability) return res.status(404).json({ message: 'Disponibilidad no encontrada' });

    await availability.update(req.body);
    res.json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar disponibilidad' });
  }
};

export const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await Availability.findByPk(id);
    if (!availability) return res.status(404).json({ message: 'Disponibilidad no encontrada' });

    await availability.destroy();
    res.json({ message: 'Disponibilidad eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar disponibilidad' });
  }
};
