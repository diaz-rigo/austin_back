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




exports.consultapedidos = async (req, res, next) => {
  
  try {
    // Realizar la consulta a la base de datos para obtener todos los pedidos
    const pedidos = await Pedido.find()
                                .populate('detallePedido')
                                .populate({
                                  path: 'usuario',
                                  model: 'User' // Cambia 'User' al nombre correcto de tu modelo de usuario si es diferente
                                });

    // Devolver los pedidos como respuesta al cliente
    res.status(200).json({ pedidos });
  } catch (error) {
    // Manejar cualquier error que ocurra durante la consulta
    console.error("Error al consultar los pedidos:", error);
    res.status(500).json({ error: "Error al consultar los pedidos" });
  }
};


exports.consultaventas = async (req, res, next) => {
  try {
    // Realizar la consulta a la base de datos para obtener todas las ventas
    const ventas = await VentaDetail.aggregate([
      {
        $lookup: {
          from: "products", // Nombre de la colección de productos
          localField: "products.product", // Campo en la colección actual que se usará para unir
          foreignField: "_id", // Campo en la colección de productos que se usará para unir
          as: "productsInfo" // Nombre del campo que contendrá la información de los productos
        }
      },
      {
        $lookup: {
          from: "users", // Nombre de la colección de usuarios
          localField: "user", // Campo en la colección actual que se usará para unir
          foreignField: "_id", // Campo en la colección de usuarios que se usará para unir
          as: "userInfo" // Nombre del campo que contendrá la información de los usuarios
        }
      }
    ]);

    // Devolver las ventas como respuesta al cliente
    res.status(200).json({ ventas });
  } catch (error) {
    // Manejar cualquier error que ocurra durante la consulta
    console.error("Error al consultar las ventas:", error);
    res.status(500).json({ error: "Error al consultar las ventas" });
  }
};

// exports.consultaventas = async (req, res, next) => {
//   try {
//     // Realizar la consulta a la base de datos para obtener todas las ventas
//     const ventas = await VentaDetail.find();

//     // Devolver las ventas como respuesta al cliente
//     res.status(200).json({ ventas });
//   } catch (error) {
//     // Manejar cualquier error que ocurra durante la consulta
//     console.error("Error al consultar las ventas:", error);
//     res.status(500).json({ error: "Error al consultar las ventas" });
//   }
// };
