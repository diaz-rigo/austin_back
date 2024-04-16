// const express = require('express');
// const router = express.Router();
// const logger = require('../logger'); // Importa tu configuración de logger

// // Middleware de registro
// function logAction(req, res, next) {
//     // Identifica el tipo de acción (GET, POST, PUT, DELETE)
//     const method = req.method;
//     // Identifica la URL y los parámetros relevantes
//     const url = req.originalUrl;
//     // Identifica al usuario que realizó la acción (puedes obtener esta información de la autenticación)
//     const userId = req.user ? req.user.id : 'Anónimo';

//     // Registra la acción en los registros
//     logger.info(`[${new Date()}] Usuario ${userId} realizó una acción ${method} en ${url}`);

//     // Continúa con el siguiente middleware
//     next();
// }

// // Rutas relacionadas con las acciones de usuarios
// router.post('/users', logAction, (req, res) => {
//     // Lógica para crear un usuario
// });

// router.get('/users/:userId', logAction, (req, res) => {
//     // Lógica para obtener un usuario
// });

// router.put('/users/:userId', logAction, (req, res) => {
//     // Lógica para actualizar un usuario
// });

// router.delete('/users/:userId', logAction, (req, res) => {
//     // Lógica para eliminar un usuario
// });

// // Rutas relacionadas con las acciones de ventas de productos
// router.post('/products', logAction, (req, res) => {
//     // Lógica para crear un producto
// });

// router.get('/products/:productId', logAction, (req, res) => {
//     // Lógica para obtener un producto
// });

// router.put('/products/:productId', logAction, (req, res) => {
//     // Lógica para actualizar un producto
// });

// router.delete('/products/:productId', logAction, (req, res) => {
//     // Lógica para eliminar un producto
// });



// // app.use('/payment', paymentRoutes);
// // app.use('/stripe', paymentStripeRoutes);
// // app.use('/mercado', paymentMercadoRoutes);
// // app.use('/order', orderRoutes);
// // app.use('/admin', ADMINREPORT);
// module.exports = router;
