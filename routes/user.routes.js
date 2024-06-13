// routes/user.routes.js
import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controllers.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/new', (req, res) => res.render('new'));
router.post('/', createUser);
router.get('/:id', getUserById);
router.get('/:id/edit', async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  res.render('edit', { user });
});
router.post('/:id', updateUser);
router.post('/:id/delete', deleteUser);

export default router;
