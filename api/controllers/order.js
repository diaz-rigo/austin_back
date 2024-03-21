
require('dotenv').config();
const User = require('../models/user');
const mongoose = require("mongoose");
const Purchase = require("../models/purchaseSchema");
const PurchaseDetail = require("../models/purchaseDetail");
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
    // const paypalOrderId = req.body.paypalOrderId;
    const { subscription, paypalOrderId } = req.body;
    // const { email, subscription } = req.body;

    const purchase = await Purchase.findOne({ paypalOrderID: paypalOrderId });
    if (!purchase) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const purchaseDetailId = purchase.details[0];
    const purchaseDetail = await PurchaseDetail.findById(purchaseDetailId);
    if (!purchaseDetail) {
      return res.status(404).json({ message: 'Detalle de compra no encontrado' });
    }
    // Verificar si el estado de la compra ya es "PAID"
    if (purchaseDetail.status === 'PAID') {
      return res.status(200).json({ message: 'La compra ya está pagada, no se requieren notificaciones adicionales' });
    }
    // if (!subscription || !subscription.endpoint || !subscription.keys) {
    //   return res.status(400).json({ error: 'La suscripción no es válida.' });
    // }
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'La suscripción no es válida.' });
    }

    // Accediendo al usuario asociado al pedido
    const user = await User.findById(purchase.user);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userEmail = user.email;
    const userName = user.name;
    console.log(userEmail, userName)
    purchaseDetail.status = 'PAID';

    const payload = {
      notification: {
        title: 'Seguimiento de Pedido',
        body: `Número de seguimiento: ${paypalOrderId}`,
        icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
        vibrate: [200, 100, 200],
        sound: 'https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830978/sound/kjiefuwbjnx72kg7ouhb.mp3',
        priority: 'high',
      }
    };

    // Envío de notificación push
    webpush.sendNotification(subscription, JSON.stringify(payload))
      .then(() => {
        console.log('Notificación enviada con éxito');
      })
      .catch(err => {
        console.error('Error al enviar notificación:', err);
      });
    console.log(userEmail, userName)


    const mailOptionsSeguimiento = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: userEmail,
      subject: 'Seguimiento de tu Pedido - Pastelería Austin\'s',
      html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding: 20px;">
            <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
          </div>
          <div style="text-align: center; padding: 20px;">
            <h2 style="font-size: 24px; color: #333;">¡Gracias por tu compra en Pastelería Austin's!</h2>
            <p style="color: #555; font-size: 16px;">Tu pedido ha sido procesado con éxito y pronto estará en camino. A continuación, te proporcionamos el número de seguimiento de tu pedido y las instrucciones para consultar su estado:</p>
            <p style="font-weight: bold; font-size: 16px;">Número de Seguimiento: ${paypalOrderId}</p>
            <p style="color: #555; font-size: 16px;">Instrucciones para consultar el estado del pedido:</p>
            <ol style="color: #555; font-size: 16px;">
              <li>Ingresa a nuestro sitio web.</li>
              <li>Ve a la sección de "Seguimiento de Pedidos" o "Mis Pedidos".</li>
              <li>Ingresa el número de seguimiento proporcionado arriba.</li>
              <li>Consulta el estado actualizado de tu pedido.</li>
            </ol>
          </div>
          <p style="text-align: center; color: #777; font-size: 14px;">¡Esperamos que disfrutes de tu compra! Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
        </div>
      </div>
    `,
    };
    // Envío de correo electrónico
    const mailOptionsInvitacion = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: userEmail,
      subject: '¡Únete a Pastelería Austin\'s y disfruta de beneficios exclusivos!',
      html: `
    <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px;">
          <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
        </div>
        <div style="text-align: center; padding: 20px;">
          <h2 style="font-size: 24px; color: #333;">¡Únete a Pastelería Austin's y disfruta de beneficios exclusivos!</h2>
          <p style="color: #555; font-size: 16px;">Gracias por elegirnos para tus compras en línea. Para ofrecerte una experiencia aún mejor, te invitamos a activar tu cuenta y disfrutar de los siguientes beneficios:</p>
          <ul style="color: #555; font-size: 16px;">
            <li>Acceso rápido y fácil a tu historial de pedidos.</li>
            <li>Seguimiento en tiempo real de tus pedidos.</li>
            <li>Ofertas especiales y descuentos personalizados.</li>
            <li>Gestión sencilla de tus direcciones de envío y métodos de pago.</li>
          </ul>
          <p style="color: #555; font-size: 16px;">Regístrate ahora y aprovecha al máximo tus compras en línea con nosotros. ¡Es rápido, fácil y gratuito!</p>
          <a  style="display: inline-block; padding: 10px 20px; background-color: #ff5733; color: #fff; text-decoration: none; border-radius: 5px;">Activar cuenta</a>
        </div>
        <p style="text-align: center; color: #777; font-size: 14px;">Si prefieres no activar tu cuenta en este momento, puedes ignorar este mensaje.</p>
      </div>
    </div>
  `,
    };



    // await transporter.sendMail(mailOptionsInvitacion);

    transporter.sendMail(mailOptionsSeguimiento, (error, info) => {
      if (error) {
        console.error('Error al enviar correo electrónico:', error);
      } else {
        console.log('Correo electrónico enviado con éxito:', info.response);
      }
    });
    transporter.sendMail(mailOptionsInvitacion, (error, info) => {
      if (error) {
        console.error('Error al enviar correo electrónico:', error);
      } else {
        console.log('Correo electrónico enviado con éxito:', info.response);
      }
    });

    await purchaseDetail.save();
    res.status(200).json({ message: 'Estado del detalle de compra actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado del detalle de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
