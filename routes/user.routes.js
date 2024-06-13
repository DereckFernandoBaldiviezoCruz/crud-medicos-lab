// routes/user.routes.js
import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/user.controllers.js';
import User from '../models/user.js'; // Importa el modelo de usuario para usarlo en la ruta de edición

const router = Router();

router.get('/', getAllUsers);
router.get('/new', (req, res) => res.render('new'));
router.post('/', createUser);
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

router.get('/search', async (req, res) => {
    const { query } = req.query;
    try {
      const users = await User.findAll({
        where: {
          [Sequelize.Op.or]: [
            { fullname: { [Sequelize.Op.iLike]: `%${query}%` } },
            { username: { [Sequelize.Op.iLike]: `%${query}%` } },
            { role: { [Sequelize.Op.iLike]: `%${query}%` } }
          ]
        }
      });
      res.render('index_users', { users });  // Renderiza la vista index_users con los resultados de la búsqueda
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
