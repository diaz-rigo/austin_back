require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
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

// // const Compra = require('../models/compra');
// const mongoose = require('mongoose');
// const User = require('./models/User'); // Asegúrate de ajustar el path según tu estructura de proyecto
// const Product = require('./models/Product'); // Asegúrate de ajustar el path según tu estructura de proyecto
// const Venta = require('./models/Venta'); // Asegúrate de ajustar el path según tu estructura de proyecto
// const VentaDetail = require('./models/VentaDetail'); // Asegúrate de ajustar el path según tu estructura de proyecto
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
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

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
            stripeSessionID: null, // Aquí puedes manejar la integración con Stripe si lo necesitas
            trackingNumber: generarCodigoPedido()
        });
        await venta.save();

        // Actualizar el stock del producto
        product.stock -= quantity;
        await product.save();

        // Responder a la solicitud
        res.status(200).json({ message: 'Compra creada exitosamente.', ventaId: venta._id });

    } catch (error) {
        console.error(`Error al crear la compra: ${error.message}`);
        res.status(500).json({ message: 'Error interno del servidor.' });
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