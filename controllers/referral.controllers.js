// controllers/referral.controllers.js
import Referral from '../models/referral.js';
import Appointment from '../models/appointment.js';
import Medic from '../models/medic.js';
import Patient from '../models/patient.js';
import Specialty from '../models/specialty.js';

export const createReferral = async (req, res) => {
  try {
    const { fromMedicId, patientId, specialtyId, toMedicId, toCenterId, reason, date, time } = req.body;

    const patient = await Patient.findByPk(patientId);
    const fromMedic = await Medic.findByPk(fromMedicId);
    const specialty = await Specialty.findByPk(specialtyId);

    if (!patient || !fromMedic || !specialty) {
      return res.status(400).json({ message: 'Datos inválidos para derivación' });
    }

    const referral = await Referral.create({
      patientId: patient.id,
      fromMedicId: fromMedic.id,
      fromCenterId: fromMedic.healthCenterId,
      toMedicId: toMedicId || null,
      toCenterId: toCenterId || null,
      specialtyId: specialty.id,
      reason,
      status: 'requested',
    });

    let specialistAppointment = null;
    if (toMedicId && date && time && toCenterId) {
      specialistAppointment = await Appointment.create({
        patientId: patient.id,
        medicId: toMedicId,
        healthCenterId: toCenterId,
        specialtyId: specialty.id,
        date,
        time,
        type: 'specialist',
        status: 'pending',
        reason: `Derivado: ${reason}`,
      });
      referral.status = 'scheduled';
      await referral.save();
    }

    res.status(201).json({ referral, specialistAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al crear derivación' });
  }
};

export const listReferralsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const referrals = await Referral.findAll({ where: { patientId } });
    res.json(referrals);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar derivaciones' });
  }
};
