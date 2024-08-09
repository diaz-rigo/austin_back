const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Ruta para crear un nuevo contacto
router.post('/', contactController.createContact);

// Ruta para obtener todos los contactos aprobados
router.get('/approved', contactController.getApprovedContacts);

// Ruta para obtener todos los contactos pendientes
router.get('/pending', contactController.getPendingContacts);

// Ruta para aprobar un contacto
router.patch('/approve/:id', contactController.approveContact);

module.exports = router;
