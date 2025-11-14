// controllers/medic.controllers.js
import Medic from '../models/medic.js';
import User from '../models/user.js';
import HealthCenter from '../models/healthCenter.js';
import Specialty from '../models/specialty.js';

// GET /medics  – listar todos los médicos
export const getAllMedics = async (req, res) => {
  try {
    const medics = await Medic.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'fullname', 'username', 'role']
        },
        {
          model: HealthCenter,
          attributes: ['id', 'name', 'level', 'address']
        },
        {
          model: Specialty,
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(medics);
  } catch (err) {
    console.error('Error getAllMedics:', err);
    res.status(500).json({ message: 'Error al obtener médicos' });
  }
};

// GET /medics/:id  – obtener un médico por ID
export const getMedicById = async (req, res) => {
  try {
    const { id } = req.params;

    const medic = await Medic.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullname', 'username', 'role']
        },
        {
          model: HealthCenter,
          attributes: ['id', 'name', 'level', 'address']
        },
        {
          model: Specialty,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!medic) {
      return res.status(404).json({ message: 'Médico no encontrado' });
    }

    res.json(medic);
  } catch (err) {
    console.error('Error getMedicById:', err);
    res.status(500).json({ message: 'Error al obtener médico' });
  }
};
