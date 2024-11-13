// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Ruta para crear feedback
router.post('/save', feedbackController.createFeedback);

module.exports = router;
