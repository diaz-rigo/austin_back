require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const webpush = require('web-push');
const PushSubscription = require('../models/pushSubscription'); // Importa el modelo de suscripción push

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


const VentaDetail = require("../models/ventaDetail");
const Venta = require("../models/ventaSchema");
// const User = require("../models/user");
const Product = require("../models/product");
exports.CREATE_COMPRA = async (req, res) => {
    try {
        const { userId, productId, quantity, totalPrice } = req.body;

        if (!userId || !productId || !quantity || !totalPrice) {
            return res.status(400).json({ message: 'Faltan datos requeridos.' });
        }

        // Validar el usuario
        const user = await User.findById(userId);
        // const isNewUser = !user;

        // if (isNewUser) {
        //     return res.status(404).json({ message: 'Usuario no encontrado.' });
        // }

        // Validar el producto
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Stock insuficiente.' });
        }

        // Crear el detalle de la venta
        const ventaDetail = new VentaDetail({
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            products: [{
                product: productId,
                quantity: quantity,
            }],
            totalAmount: totalPrice,
            status: 'PENDING',
        });
        await ventaDetail.save();

        // Crear la venta
        const venta = new Venta({
            _id: new mongoose.Types.ObjectId(),
            user: userId,
            details: ventaDetail._id,
            totalAmount: totalPrice,
            stripeSessionID: null,
            trackingNumber: generarCodigoPedido()
        });
        await venta.save();

        // Actualizar el stock del producto
        product.stock -= quantity;
        await product.save();
        const fechaActual = new Date().toLocaleString();

        // Enviar notificación por correo si es la primera vez del usuario
        // if (isNewUser) {
            const mailOptionsSeguimiento = {
                from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
                to: user.email,
                subject: '¡Tu pedido ha sido solicitado! - Pastelería Austin\'s',
                html: `
                    <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center; padding: 20px;">
                                <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Logo de Pastelería Austin's" style="max-width: 100px;">
                            </div>
                            <div style="text-align: center; padding: 20px;">
                                <p style="color: #555; font-size: 16px;">¡Gracias por confiar en Pastelería Austin's para tus deliciosos postres! Tu pedido ha sido solicitado con éxito y pronto nos comunicaremos.</p>
                                <p style="font-weight: bold; font-size: 16px;">CÓDIGO DE PEDIDO: ${venta.trackingNumber} 🎂</p>
                                <p style="color: #555; font-size: 16px;">Tu pedido fue realizado a través de Alexa el ${fechaActual}.</p>
                                <p style="color: #555; font-size: 16px;">Sigue estos pasos para consultar el estado de tu pedido:</p>
                                <ol style="color: #555; font-size: 16px;">
                                    <li>Ingresa a nuestro <a href="https://austins.vercel.app">sitio web 🌐</a>.</li>
                                    <li>Dirígete a la sección de "Seguimiento de Pedidos" o "Mis Pedidos".</li>
                                    <li>Ingresa el número de pedido proporcionado arriba.</li>
                                    <li>Consulta el estado actualizado de tu pedido.</li>
                                </ol>
                            </div>
                            <p style="text-align: center; color: #777; font-size: 14px;">¡Esperamos que disfrutes de tu pedido! Si necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte. 🍰🎉</p>
                        </div>
                    </div>
                `,
            };

            await enviarCorreo(mailOptionsSeguimiento);
        // }

        // Enviar notificación push si el usuario tiene suscripciones
        if (user.subscriptions && user.subscriptions.length > 0) {
            for (const subscriptionId of user.subscriptions) {
                const subscription = await PushSubscription.findById(subscriptionId);
                if (subscription) {
                    const payload = {
                        notification: {
                            title: 'Seguimiento de tu Pedido 🍰',
                            body: `¡Tu pedido realizado a través de Alexa ha sido solicitado! Sigue el estado con el código: ${venta.trackingNumber} 🎉`,
                            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
                            vibrate: [200, 100, 200],
                            sound: 'https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830978/sound/kjiefuwbjnx72kg7ouhb.mp3',
                            priority: 'high',
                            data: {
                                url: "https://austins.vercel.app"
                            },
                            actions: [
                                { action: "ver_pedido", title: "Ver Pedido" },
                            ],
                            expiry: Math.floor(Date.now() / 1000) + 28 * 86400,
                            timeToLive: 28 * 86400,
                            silent: false
                        }
                    };

                    try {
                        await enviarNotificacionPush2(subscription, payload, user._id);
                        console.log('Notificación push enviada exitosamente');
                    } catch (error) {
                        console.error('Error al enviar la notificación push:', error);
                    }
                }
            }
        }

        // Responder a la solicitud
        res.status(200).json({ message: 'Compra pendiente creada exitosamente.', code: venta.trackingNumber});

    } catch (error) {
        console.error(`Error al crear la compra: ${error.message}`);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
const enviarNotificacionPush2 = async (subscription, payload, iduser) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      console.log('Notificación push enviada con éxito');
    } catch (error) {
      console.error('Error al enviar notificación push:', error);
      throw error;
    }
  };

// Función para enviar correo electrónico
const enviarCorreo = async (mailOptions) => {
    try {
      await transporter.sendMail(mailOptions);
      console.log('Correo electrónico enviado con éxito:', mailOptions.to);
    } catch (error) {
      console.error('Error al enviar correo electrónico:', error);
      throw error;
    }
  };

const generarCodigoPedido = () => {
  const longitud = 6;
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigoPedido = '';

  for (let i = 0; i < longitud; i++) {
    const caracterAleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    codigoPedido += caracterAleatorio;
  }

  return codigoPedido;
};
// // Función auxiliar para generar el código de pedido
// const generarCodigoPedido = () => {
//     // Aquí puedes implementar tu lógica para generar un código único de pedido
//     return `PED-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
// };


exports.AUTH_USER_ = async (req, res) => {
    const { name, phone } = req.body;
    
    try {
        // Buscar usuario por nombre y teléfono
        const user = await User.findOne({ name, phone });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Si el usuario es encontrado, retorna los datos del usuario
        return res.status(200).json({
            message: 'Authentication successful',
            user: {
                _id: user._id,
                email: user.email,
                rol: user.rol,
                name: user.name,
                maternalLastname: user.maternalLastname,
                paternalLastname: user.paternalLastname,
                phone: user.phone,
                status: user.status,
                address: user.address,
                city: user.city,
                postalCode: user.postalCode,
                country: user.country,
                securityQuestion: user.securityQuestion,
                securityAnswer: user.securityAnswer,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};