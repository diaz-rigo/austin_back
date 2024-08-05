// routes/orders.js
const express = require('express');
const router = express.Router();
// const orderController = require('../controllers');
const orderController = require('../controllers/modelocontrol_.js');

router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
