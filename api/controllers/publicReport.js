"use strict";

// Importaciones
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const webpush = require('web-push');
const dotenv = require('dotenv');
const User = require('../models/user');
const Pedido = require('../models/order');
const PedidoDetalle = require('../models/orderDetail');
const VentaDetail = require("../models/ventaDetail");
const Venta = require("../models/ventaSchema");

// Configurar variables de entorno
dotenv.config();


exports.list_compras_iduser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const compras = await Venta.find({ user: userId })
      .populate('details')
      .exec();

    if (!compras) {
      return res.status(404).json({ message: "No se encontraron compras para el usuario." });
    }

    res.status(200).json(compras);
  } catch (error) {
    next(error);
  }
};

exports.list_pedidos_iduser = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const pedidos = await Pedido.find({ usuario: userId })
      .populate('detallePedido')
      .exec();

    if (!pedidos) {
      return res.status(404).json({ message: "No se encontraron pedidos para el usuario." });
    }

    res.status(200).json(pedidos);
  } catch (error) {
    next(error);
  }
};
// Configurar el transporte de correo
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSMAIL,
  },
});



exports.consultaventas_or_pedidos_by_code = async (req, res, next) => {
  try {
    const { code } = req.query; // Se obtiene el código desde los parámetros de consulta
    console.log(code)

    // Buscar si existe un pedido con el código proporcionado
    let pedido = await Pedido.findOne({ codigoPedido: code });

    // Si no se encuentra un pedido, buscar una venta con el código proporcionado
    if (!pedido) {
      let venta = await Venta.findOne({ trackingNumber: code }).populate('details');

      if (venta) {
        // Aquí puedes acceder a los detalles de la venta a través de la propiedad "details" de la venta
        const detallesVenta = venta.details;

        // Construir el objeto de resultado con los datos de la venta y los detalles de la venta
        const usuario = await User.findById(venta.user);
        const resultado = {
          _id: venta._id,
          user: usuario,
          details: detallesVenta,
          totalAmount: venta.totalAmount,
          paypalOrderID: venta.paypalOrderID,
          createdAt: venta.createdAt
        };

        // Devolver la respuesta al cliente
        res.status(200).json({ resultado });
      }

 
    } else {
      // Acceder a los datos del usuario y los detalles del pedido
      const usuario = await User.findById(pedido.usuario);
      const detallePedido = await PedidoDetalle.findById(pedido.detallePedido[0]);

      // Construir el objeto de resultado con los datos del pedido y del usuario
      const resultado = {
        _id: pedido._id,
        codigoPedido: pedido.codigoPedido,
        usuario: usuario,
        detallePedido: detallePedido,
        estadoPedido: pedido.estadoPedido,
        createdAt: pedido.createdAt
      };

      // Si se encontró un pedido, devolverlo como respuesta al cliente
      res.status(200).json({ resultado });
    }
  } catch (error) {
    // Manejar cualquier error que ocurra durante la búsqueda
    console.error("Error al buscar pedido o venta:", error);
    res.status(500).json({ error: "Error al buscar pedido o venta" });
  }
};

