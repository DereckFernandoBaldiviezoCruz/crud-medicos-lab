// routes/user.routes.js
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user.controllers.js';

const router = Router();

// GET /users
router.get('/', getAllUsers);

// GET /users/:id
router.get('/:id', getUserById);

// POST /users
router.post('/', createUser);

// PUT /users/:id
router.put('/:id', updateUser);

// DELETE /users/:id
router.delete('/:id', deleteUser);

export default router;
