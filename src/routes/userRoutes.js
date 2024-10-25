const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Ruta para registrar un nuevo usuario consumidor
router.post('/register-consumer', userController.registerConsumer);

// Ruta para que el super admin registre a los admins del bar y staff
router.post('/register-bar-staff', userController.registerStaff);

// Ruta para iniciar sesión
router.post('/login', userController.login);

module.exports = router;
