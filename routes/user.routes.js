import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, searchUsers } from '../controllers/user.controllers.js';
import User from '../models/user.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/new', (req, res) => res.render('new'));
router.post('/', createUser);

// Ruta de búsqueda antes de las rutas con parámetros
router.get('/search', searchUsers);

router.get('/:id', getUserById);
router.get('/:id/edit', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('edit', { user });
  } catch (error) {
    res.status(500).send(error.message);
  }
});
router.post('/:id', updateUser);
router.post('/:id/delete', deleteUser);

export default router;
