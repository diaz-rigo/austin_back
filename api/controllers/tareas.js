const cron = require('node-cron');
const Purchase = require('./models/purchase'); // Importa el modelo de la compra
const User = require('./models/user'); // Importa el modelo del usuario

"use strict";
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER,
        pass: process.env.PASSMAIL,
    },
});

// Programa el proceso de fondo para que se ejecute todos los días a las 12:00 a.m.
cron.schedule('0 0 * * *', async () => {
    try {
        // Obtén todas las compras pendientes creadas hace más de 72 horas
        // const cutoffDate = new Date(Date.now() - 72 * 60 * 60 * 1000); // 72 horas en milisegundos
        // const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas en milisegundos
        const cutoffDate = new Date(Date.now() - 1* 60 * 60 * 1000); // 4 horas en milisegundos
        const pendingPurchases = await Purchase.find({ status: 'PENDING', createdAt: { $lte: cutoffDate } });

        // Procesa cada compra pendiente
        for (const purchase of pendingPurchases) {
            // Obtén la información del usuario
            const user = await User.findById(purchase.user);

            // Envía un correo electrónico al usuario con la indicación o seguimiento de pedido
            await transporter.sendMail({
                from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
                to: user.email,
                subject: 'Indicación de Pedido Pendiente',
                text: 'Tu pedido está pendiente y ha pasado el plazo de 72 horas. Por favor, contáctanos para más información.'
            });

            // Actualiza el estado de la compra a "Cancelado"
            purchase.status = 'CANCELLED';
            await purchase.save();
        }
    } catch (error) {
        console.error('Error en el proceso de fondo:', error);

        // Enviar correo electrónico de error
        await transporter.sendMail({
            from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
            to: '20211036@uthh.edu.mx',
            subject: 'Error en Tarea Cron',
            text: `Se ha producido un error en la tarea cron de fondo:\n${error}`
        });
    }
});
