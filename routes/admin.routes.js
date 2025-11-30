import { Router } from 'express';
import {
  createHealthCenter,
  createMedic,
  createSpecialty,
  createUser,
  registerPatient
} from '../controllers/admin.controllers.js';

import HealthCenter from '../models/healthCenter.js';
import Medic from '../models/medic.js';
import Patient from '../models/patient.js';
import Specialty from '../models/specialty.js';
import User from '../models/user.js';
import Availability from '../models/availability.js';

const router = Router();

/* =============================
   📌 VISTAS DEL PANEL PRINCIPAL
   ============================= */
router.get('/', async (req, res) => {
  const totalPatients = await Patient.count();
  const totalMedics = await Medic.count();
  const totalCenters = await HealthCenter.count();
  const totalSpecialties = await Specialty.count();
  const totalUsers = await User.count();

  res.render('admin/dashboard', {
    adminName: 'Administrador Ejemplo',
    totalPatients,
    totalMedics,
    totalCenters,
    totalSpecialties,
    totalUsers
  });
});



/* =============================
   📌 CRUD USUARIOS (Form + Lista)
   ============================= */
router.get('/users', async (req, res) => {
  const users = await User.findAll({ order: [['id', 'ASC']] });
  res.render('admin/users/index', { users });
});

router.get('/users/new', (req, res) => {
  res.render('admin/users/new');
});

router.get('/users/:id/edit', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.render('admin/users/edit', { user });
});

router.post('/users', createUser);
router.post('/users/:id/edit', async (req, res) => {
  const { fullname, username, role } = req.body;

  await User.update(
    { fullname, username, role },
    { where: { id: req.params.id } }
  );

  res.redirect('/admin/users');
});

router.get('/users/:id/delete', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/users');
});

/* =============================
   📌 CRUD PACIENTES
   ============================= */

// LISTA DE PACIENTES
router.get('/patients', async (req, res) => {
  const patients = await Patient.findAll({
    include: [
      { model: User, as: 'User', attributes: ['fullname', 'username', 'password'] },
      { model: HealthCenter, attributes: ['name'] }
    ]
  });

  res.render('admin/patients/index', { patients });
});

// FORMULARIO NUEVO PACIENTE
router.get('/patients/new', async (req, res) => {
  const centers = await HealthCenter.findAll();
  res.render('admin/patients/new', { centers });
});

// FORMULARIO EDITAR PACIENTE
router.get('/patients/:id/edit', async (req, res) => {
  const patient = await Patient.findByPk(req.params.id, {
    include: [
      { model: User, as: 'User', attributes: ['fullname', 'username'] },
      { model: HealthCenter, attributes: ['name'] }
    ]
  });

  const centers = await HealthCenter.findAll();

  res.render('admin/patients/edit', { patient, centers });
});


router.post('/patients/:id/edit', async (req, res) => {
  const { fullname, ci, healthCenterId, medicalHistorySummary } = req.body;

  // Obtener paciente
  const patient = await Patient.findByPk(req.params.id);
  const user = await User.findByPk(patient.userId);

  // Actualizar usuario
  user.fullname = fullname;
  user.username = ci;
  await user.save();

  // Actualizar paciente
  patient.healthCenterId = healthCenterId;
  patient.medicalHistorySummary = medicalHistorySummary;
  await patient.save();

  res.redirect('/admin/patients');
});

router.get('/patients/:id/delete', async (req, res) => {
  const patient = await Patient.findByPk(req.params.id);
  const userId = patient.userId;

  // Eliminar paciente
  await patient.destroy();

  // Eliminar usuario asociado
  await User.destroy({ where: { id: userId } });

  res.redirect('/admin/patients');
});

// GUARDAR PACIENTE
router.post('/patients', registerPatient);


/* =============================
   📌 CRUD MÉDICOS
   ============================= */

// LISTA DE MÉDICOS
router.get('/medics', async (req, res) => {
  const medics = await Medic.findAll({
    include: [
      { model: User, attributes: ['fullname', 'username'] },
      { model: Specialty, attributes: ['name'] },
      { model: HealthCenter, attributes: ['name'] }
    ]
  });

  res.render('admin/medics/index', { medics });
});


// FORMULARIO NUEVO MÉDICO
router.get('/medics/new', async (req, res) => {
  const centers = await HealthCenter.findAll();
  const specialties = await Specialty.findAll();

  res.render('admin/medics/new', { centers, specialties });
});


// GUARDAR MÉDICO
router.post('/medics', async (req, res) => {
  const { fullname, username, specialtyId, healthCenterId } = req.body;

  // 1. Crear usuario
  const user = await User.create({
    fullname,
    username,
    password: username, // CI como contraseña inicial
    role: "medic"
  });

  // 2. Crear médico
  await Medic.create({
    userId: user.id,
    specialtyId,
    healthCenterId
  });

  res.redirect('/admin/medics');
});


// FORMULARIO EDITAR MÉDICO
router.get('/medics/:id/edit', async (req, res) => {
  const medic = await Medic.findByPk(req.params.id, {
    include: [User]
  });

  const centers = await HealthCenter.findAll();
  const specialties = await Specialty.findAll();

  res.render('admin/medics/edit', { medic, centers, specialties });
});


// ACTUALIZAR MÉDICO
router.post('/medics/:id/edit', async (req, res) => {
  const { fullname, username, specialtyId, healthCenterId } = req.body;

  const medic = await Medic.findByPk(req.params.id);
  const user = await User.findByPk(medic.userId);

  // Actualizar usuario
  user.fullname = fullname;
  user.username = username;
  await user.save();

  // Actualizar datos del médico
  medic.specialtyId = specialtyId;
  medic.healthCenterId = healthCenterId;
  await medic.save();

  res.redirect('/admin/medics');
});


// ELIMINAR MÉDICO
router.get('/medics/:id/delete', async (req, res) => {
  const medic = await Medic.findByPk(req.params.id);
  const userId = medic.userId;

  await medic.destroy();
  await User.destroy({ where: { id: userId } });

  res.redirect('/admin/medics');
});

/* =============================
   📌 AJAX: Médicos por especialidad
   ============================= */
router.get('/medics/by-specialty/:id', async (req, res) => {
  const medics = await Medic.findAll({
    where: { specialtyId: req.params.id },
    include: [
      { model: User, attributes: ['fullname'] },
      { model: HealthCenter, attributes: ['id', 'name'] }
    ]
  });

  res.json(medics);
});



/* =============================
   📌 CRUD ESPECIALIDADES
   ============================= */
router.get('/specialties', async (req, res) => {
  const specialties = await Specialty.findAll();
  res.render('admin/specialties/index', { specialties });
});

router.get('/specialties/new', (req, res) => {
  res.render('admin/specialties/new');
});

router.post('/specialties', createSpecialty);

// EDITAR
router.get('/specialties/:id/edit', async (req, res) => {
  const specialty = await Specialty.findByPk(req.params.id);
  res.render('admin/specialties/edit', { specialty });
});

router.post('/specialties/:id/edit', async (req, res) => {
  await Specialty.update(
    { name: req.body.name },
    { where: { id: req.params.id }}
  );
  res.redirect('/admin/specialties');
});

// ELIMINAR
router.get('/specialties/:id/delete', async (req, res) => {
  await Specialty.destroy({ where: { id: req.params.id }});
  res.redirect('/admin/specialties');
});


/* =============================
   📌 CRUD CENTROS DE SALUD
   ============================= */
router.get('/healthcenters', async (req, res) => {
  const centers = await HealthCenter.findAll();
  res.render('admin/healthcenters/index', { centers });
});

router.get('/healthcenters/new', (req, res) => {
  res.render('admin/healthcenters/new');
});

router.post('/healthcenters', createHealthCenter);

// EDITAR
router.get('/healthcenters/:id/edit', async (req, res) => {
  const center = await HealthCenter.findByPk(req.params.id);
  res.render('admin/healthcenters/edit', { center });
});

router.post('/healthcenters/:id/edit', async (req, res) => {
  const { name, level, address, city } = req.body;

  await HealthCenter.update(
    { name, level, address, city },
    { where: { id: req.params.id } }
  );

  res.redirect('/admin/healthcenters');
});


/* =============================
   📌 ELIMINAR CENTRO DE SALUD
   ============================= */
router.get('/healthcenters/:id/delete', async (req, res) => {
  await HealthCenter.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/healthcenters');
});


/* =============================
   📌 CRUD HORARIOS (Availability)
   ============================= */

// LISTA DE HORARIOS
router.get('/availabilities', async (req, res) => {
  const availabilities = await Availability.findAll({
    include: [
      { 
        model: Medic, 
        include: [User, Specialty] 
      },
      { model: HealthCenter }
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
  });

  res.render('admin/availability/index', { availabilities });
});

// FORM NUEVO HORARIO
router.get('/availabilities/new', async (req, res) => {
  const specialties = await Specialty.findAll();
  res.render('admin/availability/new', { specialties });
});

// GUARDAR HORARIO (permite varios días a la vez)
router.post('/availabilities', async (req, res) => {
  let { medicId, healthCenterId, dayOfWeek, startTime, endTime, durationMinutes } = req.body;

  // dayOfWeek puede venir como string o como array si se seleccionan varios
  let days = [];

  if (Array.isArray(dayOfWeek)) {
    days = dayOfWeek;
  } else if (dayOfWeek) {
    days = [dayOfWeek];
  }

  // Por seguridad filtramos solo 1..5
  days = days.filter(d => ['1','2','3','4','5'].includes(d));

  if (days.length === 0) {
    return res.status(400).send("Debe seleccionar al menos un día de la semana.");
  }

  for (const d of days) {
    await Availability.create({
      medicId,
      healthCenterId,
      dayOfWeek: d,
      startTime,
      endTime,
      durationMinutes
    });
  }

  res.redirect('/admin/availabilities');
});


// FORM EDITAR HORARIO
router.get('/availabilities/:id/edit', async (req, res) => {
  const availability = await Availability.findByPk(req.params.id, {
    include: [
      { model: Medic, include: [User, Specialty] },
      { model: HealthCenter }
    ]
  });

  res.render('admin/availability/edit', { availability });
});

// ACTUALIZAR HORARIO
router.post('/availabilities/:id/edit', async (req, res) => {
  const { dayOfWeek, startTime, endTime, durationMinutes, isActive } = req.body;

  await Availability.update(
    {
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes,
      isActive: isActive === "true"
    },
    { where: { id: req.params.id } }
  );

  res.redirect('/admin/availabilities');
});


// ELIMINAR HORARIO
router.get('/availabilities/:id/delete', async (req, res) => {
  await Availability.destroy({ where: { id: req.params.id } });
  res.redirect('/admin/availabilities');
});

export default router;
