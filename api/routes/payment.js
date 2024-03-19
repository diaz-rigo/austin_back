const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment');

// Rutas para pagos
router.post('/', paymentController.createPayment);
router.post('/webhook', paymentController.webhook);



module.exports = router;
