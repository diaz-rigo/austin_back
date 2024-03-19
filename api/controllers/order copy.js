const mongoose = require("mongoose");
const Purchase = require("../models/purchaseSchema");
const PurchaseDetail = require("../models/purchaseDetail");
// const webpush = require('web-push');





const webpush = require('web-push');


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

// Configurar las claves VAPID
const vapidKeys = {
  publicKey: "BFYtOg9-LQWHmObZKXm4VIV2BImn5nBrhz4h37GQpbdj0hSBcghJG7h-wldz-fx9aTt7oaqKSS3KXhA4nXf32pY",
  privateKey: "daiRV8XPPoeSHC4nZ5Hj6yHr98saYGlysFAuEJPypa0"
};


webpush.setVapidDetails(
  'mailto:austins0271142@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);






exports.updateStatusOrder = async (req, res, next) => {
    try {
        // Obtener el ID del pedido de la solicitud
      // Obtener el ID del pedido de la solicitud
      const paypalOrderId = req.body.paypalOrderId; // Cambiado de orderId a paypalOrderId

      // Verificar si el pedido existe en la base de datos
      const purchase = await Purchase.findOne({ paypalOrderID: paypalOrderId }); // Buscar por paypalOrderID
      if (!purchase) {
          return res.status(404).json({ message: 'Pedido no encontrado' });
      }


        // Acceder al detalle de compra asociado al pedido
        const purchaseDetailId = purchase.details[0]; // Suponiendo que solo hay un detalle de compra por pedido
        const purchaseDetail = await PurchaseDetail.findById(purchaseDetailId);
        if (!purchaseDetail) {
            return res.status(404).json({ message: 'Detalle de compra no encontrado' });
        }

        // Actualizar el estado del detalle de compra
        purchaseDetail.status = 'PAID';
        await purchaseDetail.save();




        const payload = {
            notification: {
              title: 'Recuperación de Contraseña',
              body: `Código de verificación: ${verificationCode}`,
              icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
              vibrate: [200, 100, 200],
              sound: 'https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830978/sound/kjiefuwbjnx72kg7ouhb.mp3',
              priority: 'high',
      
            }
          };
      
          webpush.sendNotification(subscription, JSON.stringify(payload))
            .then(() => {
              console.log('Notificación de bienvenida enviada con éxito');
            })
            .catch(err => {
              console.error('Error al enviar notificación de bienvenida:', err);
            });
          res.status(200).json({ message: 'Correo de recuperación de contraseña enviado correctamente..' });
        // Enviar una respuesta exitosa
        res.status(200).json({ message: 'Estado del detalle de compra actualizado correctamente' });
    } catch (error) {
        // Manejar errores
        console.error('Error al actualizar el estado del detalle de compra:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
