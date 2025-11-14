// controllers/consultation.controllers.js
import Appointment from '../models/appointment.js';
import Consultation from '../models/consultation.js';
import Prescription from '../models/prescription.js';
import Patient from '../models/patient.js';
import Medic from '../models/medic.js';

export const createConsultation = async (req, res) => {
  try {
    const { appointmentId, medicId, diagnosis, notes, prescriptionContent } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });

    if (appointment.medicId !== Number(medicId)) {
      return res.status(403).json({ message: 'El médico no corresponde a esta cita' });
    }

    const patient = await Patient.findByPk(appointment.patientId);
    const medic = await Medic.findByPk(medicId);

    const consultation = await Consultation.create({
      appointmentId,
      medicId,
      patientId: patient.id,
      diagnosis,
      notes,
    });

    let prescription = null;
    if (prescriptionContent && prescriptionContent.trim() !== '') {
      prescription = await Prescription.create({
        consultationId: consultation.id,
        medicId: medic.id,
        patientId: patient.id,
        healthCenterId: appointment.healthCenterId,
        date: appointment.date,
        content: prescriptionContent,
      });
    }

    appointment.status = 'attended';
    await appointment.save();

    res.status(201).json({ consultation, prescription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar consulta' });
  }
};
