const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const webpush = require('web-push');

// Configurar el transporte de correo electrónico
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER, // Coloca aquí tu correo electrónico
    pass: process.env.PASSMAIL // Coloca aquí tu contraseña de correo electrónico
  }
});

// Configurar las claves VAPID para notificaciones push
const vapidKeys = {
  publicKey: "BFYtOg9-LQWHmObZKXm4VIV2BImn5nBrhz4h37GQpbdj0hSBcghJG7h-wldz-fx9aTt7oaqKSS3KXhA4nXf32pY",
  privateKey: "daiRV8XPPoeSHC4nZ5Hj6yHr98saYGlysFAuEJPypa0"
};

webpush.setVapidDetails(
  'mailto:austins0271142@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

exports.activarCuenta = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Verificar el token de activación
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Obtener el usuario desde la base de datos
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Verificar si el usuario ya está activo
    if (user.status === 'ACTIVE') {
      return res.status(400).json({ error: 'La cuenta ya está activa.' });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar la contraseña y establecer el estado a 'ACTIVE'
    user.password = hashedPassword;
    user.status = 'ACTIVE';

    await user.save();

    // Enviar notificación push
    await enviarNotificacionPush(user, password);

    // Enviar correo electrónico
    await enviarCorreoElectronico(user, password);

    res.json({ message: 'Cuenta activada correctamente.' });
  } catch (error) {
    console.error('Error al activar la cuenta:', error);

    // Determinar el tipo de error y devolver un mensaje adecuado
    let errorMessage = 'Error al activar la cuenta.';

    if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Error al verificar el token de activación.';
    } else if (error.name === 'TokenExpiredError') {
      errorMessage = 'El token de activación ha expirado.';
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Error de validación al actualizar el usuario.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(400).json({ error: errorMessage });
  }
};

async function enviarNotificacionPush(user, password) {
  // Configurar el payload de la notificación push
  const notificationPayload = JSON.stringify({
    title: '¡Cuenta Activada!',
    body: `¡Hola ${user.username}! Tu cuenta ha sido activada correctamente. Puedes acceder al sitio con la siguiente contraseña: ${password}`
    // Puedes agregar más datos según lo requiera tu aplicación
  });

  try {
    await webpush.sendNotification(user.pushSubscription, notificationPayload);
    console.log('Notificación push enviada con éxito.');
  } catch (error) {
    console.error('Error al enviar notificación push:', error);
    throw new Error('Error al enviar notificación push.');
  }
}

async function enviarCorreoElectronico(user, password) {
  // Configurar el mensaje de correo electrónico con HTML y emojis
  const mailOptions = {
    from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
    to: user.email,
    subject: '¡Cuenta Activada!',
    html: `
      <h1 style="color: #333; font-family: Arial, sans-serif;">¡Cuenta Activada!</h1>
      <p style="font-size: 16px;">¡Hola ${user.username}!</p>
      <p style="font-size: 16px;">Tu cuenta ha sido activada correctamente.</p>
      <p style="font-size: 16px;">Puedes acceder al sitio con la siguiente contraseña:</p>
      <p style="font-size: 20px; font-weight: bold;">${password}</p>
      <p style="font-size: 16px;">¡Gracias por registrarte!</p>
      <div style="font-size: 24px;">🎉🌟😊</div>
    `
  };

  // Enviar el correo electrónico
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo electrónico enviado:', info.response);
  } catch (error) {
    console.error('Error al enviar correo electrónico:', error);
    throw new Error('Error al enviar correo electrónico.');
  }
}
