// routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Ruta para obtener todas las preguntas frecuentes
router.get('/', faqController.getAllFAQs);

// Ruta para crear una nueva pregunta frecuente
router.post('/', faqController.createFAQ);

// Ruta para actualizar una pregunta frecuente
router.put('/:id', faqController.updateFAQ);

// Ruta para eliminar una pregunta frecuente
router.delete('/:id', faqController.deleteFAQ);

module.exports = router;
