const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order');

// Rutas para pagos
// router.post('/', orderController.createorder
router.post('/updateStatusOrder', orderController.updateStatusOrder);



module.exports = router;
