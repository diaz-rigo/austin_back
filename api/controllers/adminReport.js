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
const Product = require("../models/product");
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

exports.estadisticas = async (req, res, next) => {
  try {
    const ventasTotales = await VentaDetail.aggregate([
        {
            $group: {
                _id: null,
                totalVentas: { $sum: "$totalAmount" },
                totalPedidos: { $sum: 1 },
                ventasPendientes: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
                    }
                },
                ventasCompletadas: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "PAID"] }, 1, 0]
                    }
                }
            }
        }
    ]);

    res.status(200).json(ventasTotales[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.estadisticas_pedidos = async (req, res, next) => {
  try {
    const pedidosTotales = await Pedido.aggregate([
        {
            $group: {
                _id: null,
                totalPedidos: { $sum: 1 },
                pedidosPendientes: {
                    $sum: {
                        $cond: [{ $eq: ["$estadoPedido", "Pendiente"] }, 1, 0]
                    }
                },
                pedidosCompletados: {
                    $sum: {
                        $cond: [{ $eq: ["$estadoPedido", "completado"] }, 1, 0]
                    }
                },
                totalAmount: { $sum: "$precioTotal" }
            }
        }
    ]);

    res.status(200).json(pedidosTotales[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.estadisticas_user= async (req, res, next) => {
  try {
    const usuariosTotales = await User.aggregate([
        {
            $group: {
                _id: null,
                totalUsuarios: { $sum: 1 },
                usuariosActivos: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0]
                    }
                },
                usuariosInactivos: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "INACTIVE"] }, 1, 0]
                    }
                },
                roles: {
                    $push: "$rol"
                }
            }
        }
    ]);

    const rolesCount = await User.aggregate([
        {
            $group: {
                _id: "$rol",
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        usuariosTotales: usuariosTotales[0],
        rolesCount: rolesCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.estadisticas_product = async (req, res, next) => {
  try {
    const productosTotales = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProductos: { $sum: 1 },
                productosDestacados: {
                    $sum: {
                        $cond: [{ $eq: ["$isFeatured", true] }, 1, 0]
                    }
                },
                productosVegetarianos: {
                    $sum: {
                        $cond: [{ $eq: ["$isVegetarian", true] }, 1, 0]
                    }
                },
                productosSinGluten: {
                    $sum: {
                        $cond: [{ $eq: ["$isGlutenFree", true] }, 1, 0]
                    }
                },
                categorias: {
                    $push: "$category"
                }
            }
        }
    ]);

    const categoriasCount = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(200).json({
        productosTotales: productosTotales[0],
        categoriasCount: categoriasCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
