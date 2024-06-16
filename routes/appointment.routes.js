import { Router } from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  renderAppointmentForm,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointment.controllers.js';

const router = Router();

router.get('/', getAllAppointments);
router.get('/new',async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('appointment_form', { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.get('/:id', getAppointmentById);
router.post('/:id', updateAppointment);
router.post('/:id/delete', deleteAppointment);

export default router;
