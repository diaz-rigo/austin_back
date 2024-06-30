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
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary'); // Importa la configuración de Cloudinary
const jwt = require('jsonwebtoken');
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

// webpush.setVapidDetails(
//   'mailto:austins0271142@gmail.com',
//   vapidKeys.publicKey,
//   vapidKeys.privateKey
// );

// Mensajes de error
const ERROR_USER_ALREADY_EXISTS = "El correo ya está registrado. Por favor, active su cuenta para hacer el pedido.";
const ERROR_ORDER_NOT_FOUND = "Pedido no encontrado";
const ERROR_ORDER_DETAIL_NOT_FOUND = "Detalle de compra no encontrado";
const ERROR_INVALID_SUBSCRIPTION = "La suscripción no es válida.";
const ERROR_USER_NOT_FOUND = "Usuario no encontrado";
const ERROR_INTERNAL_SERVER = "Error interno del servidor";

// Función para generar código de pedido
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

// Función para enviar notificación push
const enviarNotificacionPush = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Notificación push enviada con éxito');
  } catch (error) {
    console.error('Error al enviar notificación push:', error);
    throw error;
  }
};

// Controladores

// Controladores
exports.crearPedido = async (req, res, next) => {
  const datosPedido = req.body;
  const files = req.files; // Obtener los archivos cargados si se utiliza el middleware adecuado en Express
  console.log(datosPedido)

  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email: datosPedido.correo });
    // const fileName = path.parse(req.file.originalname).name;
    // const result = await cloudinary.uploader.upload(req.file.path, {
    //   folder: `${category}/${_id}`,
    //   public_id: fileName // Usar el nombre de archivo sin la extensión
    // });
    // Si el usuario ya existe, enviar mensaje de activación de cuenta
    if (existingUser) {

      const token = jwt.sign(
        { userId: existingUser._id },
        process.env.JWT_KEY,
        { expiresIn: '24h' } // El token expira en 24 horas
      );

      // Enviar correo de activación
      const activationLink = `https://austins.vercel.app/auth/activate/${token}`;
      const mailOptionsActivacion = {
        from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
        to: datosPedido.correo,
        subject: 'Activa tu cuenta en Pastelería Austin\'s',
        html: `
    <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
      <h2 style="color: #d17a3b; text-align: center;">¡Activa tu cuenta en Pastelería Austin's!</h2>
      <p style="font-size: 16px;">¡Hola ${datosPedido.nombre}!</p>
      <p style="font-size: 16px;">Por favor, haz clic en el siguiente enlace para activar tu cuenta:</p>
      <p style="font-size: 18px; text-align: center;"><a href="${activationLink}" style="color: #d17a3b; text-decoration: none;">Activar mi cuenta</a></p>
      <p style="font-size: 16px;">Una vez activada tu cuenta, podrás ingresar con tu contraseña.</p>
      <p style="font-size: 24px; text-align: center;">🍰🎉🎂</p>
    </div>
  `,
      };

      enviarCorreo(mailOptionsActivacion);
      return res.status(409).json({
        message: ERROR_USER_ALREADY_EXISTS,
      });
    }


    // Crear un nuevo objeto de usuario
    const nuevoUsuario = new User({
      _id: new mongoose.Types.ObjectId(),
      name: datosPedido.nombre || '',
      maternalLastname: datosPedido.apellido1 || '',
      paternalLastname: datosPedido.apellido2 || '',
      email: datosPedido.correo || '',
      phone: datosPedido.telefono || '',
      // Asignar contraseña y nombre de usuario por defecto
      password: 'contraseñaPorDefecto',
      status: 'INACTIVE',
    });

    // Guardar el nuevo usuario en la base de datos
    

    // Generar un código de pedido único
    const codigoPedido = generarCodigoPedido();

    // Crear un nuevo objeto de pedido y detalle de pedido
    const pedido = new Pedido({
      _id: new mongoose.Types.ObjectId(),
      usuario: nuevoUsuario._id,
      estadoPedido: datosPedido.estadoPedido || 'Pendiente',
      codigoPedido: codigoPedido,
    });


    // Calcular el precio total del pedido
    const precioPorKilo = datosPedido.sabor?.precioPorKilo || 0; // Obtener el precio por kilo del sabor, si está disponible


    const cantidad = datosPedido.cantidad || 400;
    const precioTotal = precioPorKilo * cantidad;
    //const result = await cloudinary.uploader.upload(req.file.path);
    // Verificar y asignar los campos del detalle del pedido según los datos recibidos

    const detallePedidoData = {
      _id: new mongoose.Types.ObjectId(),
      pedido: pedido._id,
      nombre: datosPedido.nombre || '',
      cantidad: datosPedido.cantidad || 0,
      dia: datosPedido.dia ? new Date(datosPedido.dia) : new Date(), // Si no se proporciona la fecha, usar la fecha actual
      hora: datosPedido.hora || '',
      modo: datosPedido.modo || '',
      modoPersonalizado: datosPedido.modoPersonalizado || '',
      sabor: datosPedido.sabor ? datosPedido.sabor.name : datosPedido.saborpersonalizado || '',
      saborPersonalizado: datosPedido.saborpersonalizado || '',
      precioTotal: precioTotal,
      color: datosPedido.color_personalizado,

    };

    // Guardar el detalle del pedido en la base de datos
    const detallePedido = new PedidoDetalle(detallePedidoData);
    await detallePedido.save();

    // Asociar el detalle del pedido al pedido principal
    pedido.detallePedido.push(detallePedido);

    // Guardar el pedido en la base de datos
    await pedido.save();
    await nuevoUsuario.save();
    // Enviar notificación por correo y mensaje de notificación si es la primera vez del usuario
    if (!existingUser) {
      const mailOptionsSeguimiento = {
        from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
        to: datosPedido.correo,
        subject: '¡Tu pedido ha sido solicitado! - Pastelería Austin\'s',
        html: `
          <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; padding: 20px;">
                <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Logo de Pastelería Austin's" style="max-width: 100px;">
              </div>
              <div style="text-align: center; padding: 20px;">
                <p style="color: #555; font-size: 16px;">¡Gracias por confiar en Pastelería Austin's para tus deliciosos postres! Tu pedido ha sido solicitado con éxito y pronto nos comunicaremos.</p>
                <p style="font-weight: bold; font-size: 16px;">CODIGO PEDIDO: ${codigoPedido} 🎂</p>
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



      // Envío de correo electrónico
      await enviarCorreo(mailOptionsSeguimiento);
      // console.log(datosPedido.suscripcion)

      // Enviar notificación push si se proporciona una suscripción
      // Envío de la notificación push si se proporciona una suscripción
      if (datosPedido.suscripcion) {

        const payload = {
          notification: {
            title: 'Seguimiento de tu Pedido 🍰',
            body: `¡Tu pedido ha sido solicitado! Sigue el estado con el código: ${codigoPedido} 🎉`,
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [200, 100, 200],
            sound: 'https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830978/sound/kjiefuwbjnx72kg7ouhb.mp3',
            priority: 'high',
            data: {
              url: "https://austins.vercel.app" // Enlace al sitio o aplicación
            },
            actions: [
              { action: "ver_pedido", title: "Ver Pedido" },
            ],
            expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // Expira en 28 días
            timeToLive: 28 * 86400, // Tiempo de vida en segundos
            silent: false // No silenciar
          }
        };



        try {
          // Envío de la notificación push
          await enviarNotificacionPush(datosPedido.suscripcion, payload);
          console.log('Notificación push enviada exitosamente');
        } catch (error) {
          console.error('Error al enviar la notificación push:', error);
          // Manejar el error de manera adecuada
        }
      }
      // Marcar al usuario como activo
      await nuevoUsuario.save();
    }

    res.status(201).json({
      message: "Pedido de pastelería creado con éxito",
      pedido: pedido
    });
  } catch (error) {
    // En caso de que ocurra un error, manejarlo adecuadamente y enviar una respuesta al cliente
    console.error('Error al crear pedido:', error);
    res.status(500).json({
      error: ERROR_INTERNAL_SERVER
    });
  }
};


exports.updateStatusOrder = async (req, res, next) => {
  try {
    const { subscription, paypalOrderId } = req.body;

    const venta = await Venta.findOne({ paypalOrderID: paypalOrderId });
    if (!venta) {
      return res.status(404).json({ message: ERROR_ORDER_NOT_FOUND });
    }

    const ventaDetailId = venta.details[0];
    const ventaDetail = await VentaDetail.findById(ventaDetailId);
    if (!ventaDetail) {
      return res.status(404).json({ message: ERROR_ORDER_DETAIL_NOT_FOUND });
    }

    if (ventaDetail.status === 'PAID') {
      return res.status(200).json({ message: 'La compra ya está pagada, no se requieren notificaciones adicionales' });
    }

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: ERROR_INVALID_SUBSCRIPTION });
    }

    const user = await User.findById(venta.user);
    if (!user) {
      return res.status(404).json({ message: ERROR_USER_NOT_FOUND });
    }

    const userEmail = user.email;
    const userName = user.name;

    ventaDetail.status = 'PAID';

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
    await enviarNotificacionPush(subscription, payload);

    // const mailOptionsSeguimiento = {
    //   from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
    //   to: userEmail,
    //   subject: 'Seguimiento de tu Pedido - Pastelería Austin\'s',
    //   html: `
    //     <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
    //       <!-- Código HTML del correo -->
    //     </div>
    //   `,
    // };
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
    await enviarCorreo(mailOptionsSeguimiento);

    if (user.rol === 'GUEST') {
      // const mailOptionsInvitacion = {
      //   from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      //   to: userEmail,
      //   subject: '¡Únete a Pastelería Austin\'s y disfruta de beneficios exclusivos!',
      //   html: `
      //     <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
      //       <!-- Código HTML del correo -->
      //     </div>
      //   `,
      // };
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

      // Envío de correo de invitación solo si el usuario no es un invitado
      await enviarCorreo(mailOptionsInvitacion);
    }

    await ventaDetail.save();
    res.status(200).json({ message: 'Estado del detalle de compra actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado del detalle de compra:', error);
    res.status(500).json({ message: ERROR_INTERNAL_SERVER });
  }
};

exports.actualizarImagenPedido = async (req, res) => {
  const path = require('path');
  const pedidoId = req.params.id; // Obtener el ID del pedido de los parámetros de la solicitud

  try {
    // Verificar si se proporcionó un archivo en la solicitud
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const nuevaImagen = req.file.path; // Obtener la ruta de la nueva imagen del cuerpo de la solicitud
    console.log(pedidoId);
    console.log(nuevaImagen);

    // Subir el archivo a Cloudinary
    const result = await cloudinary.uploader.upload(nuevaImagen, {
      folder: `design`,
      use_filename: true // Usar el nombre de archivo original sin la extensión
    });

    // Actualizar la imagen del pedido en la base de datos
    const pedidoActualizado = await PedidoDetalle.findByIdAndUpdate(
      pedidoId,
      { imagen: result.secure_url }, // Guardar la URL segura de la imagen en la base de datos
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Devolver el pedido actualizado como respuesta
    res.status(200).json({ message: 'Imagen del pedido actualizada correctamente', pedido: pedidoActualizado });
  } catch (error) {
    console.error('Error al actualizar imagen del pedido:', error);
    return res.status(500).json({ message: 'Error al actualizar imagen del pedido' });
  }
};
