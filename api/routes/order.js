const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');

const orderController = require('../controllers/order');

// Rutas para pagos
// router.post('/', orderController.createorder
router.post('/updateStatusOrder', orderController.updateStatusOrder);
router.post('/solicitarPedido', orderController.crearPedido);
router.post('/solicitarPedido2', orderController.crearPedido2);


// router.put("/:category/:id/image", upload.single('image'), ProductController.updateImage);

router.put('/:id/imagen', upload.single('imagen'), orderController.actualizarImagenPedido);

module.exports = router;
