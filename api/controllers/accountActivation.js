const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const PushSubscription = require('../models/pushSubscription');  // Asegúrate de importar el modelo PushSubscription si lo necesitas

// Configurar el transporte de correo electrónico
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSMAIL
  }
});





const DEFAULT_PASSWORD = 'contraseña123';
const DEFAULT_PASSWORD2 = 'contraseñaPorDefecto';


exports.sendActivationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    // Verificar si el usuario existe en la base de datos
    const existingUser = await User.findOne({ email: email });
    console.log("cuenta: encontrado",existingUser)
    if (!existingUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya tiene una contraseña establecida
    if (existingUser.password !== DEFAULT_PASSWORD) {
      return res.status(400).json({
        message: 'El usuario ya tiene una contraseña establecida. Si ha olvidado su contraseña, por favor recupérala.'
      });
    }
    if (existingUser.password !== DEFAULT_PASSWORD2) {
      return res.status(400).json({
        message: 'El usuario ya tiene una contraseña establecida. Si ha olvidado su contraseña, por favor recupérala.'
      });
    }

    // Generar el token de activación
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_KEY,
      { expiresIn: '24h' } // El token expira en 24 horas
    );

    // Enviar correo de activación
    const activationLink = `https://austins.vercel.app/auth/activate/${token}`;
    const mailOptions = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: email,
      subject: 'Activa tu cuenta en Pastelería Austin\'s',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
          <h2 style="color: #d17a3b; text-align: center;">¡Activa tu cuenta en Pastelería Austin's!</h2>
          <p style="font-size: 16px;">¡Hola ${existingUser.name}!</p>
          <p style="font-size: 16px;">Por favor, haz clic en el siguiente enlace para activar tu cuenta:</p>
          <p style="font-size: 18px; text-align: center;"><a href="${activationLink}" style="color: #d17a3b; text-decoration: none;">Activar mi cuenta</a></p>
          <p style="font-size: 16px;">Una vez activada tu cuenta, podrás ingresar con tu contraseña.</p>
          <p style="font-size: 24px; text-align: center;">🍰🎉🎂</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Correo de activación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al enviar el correo de activación' });
  }
};



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

async function enviarCorreoElectronico(user, password) {
  // Configurar el mensaje de correo electrónico con HTML y emojis
  const mailOptions = {
    from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
    to: user.email,
    subject: '¡Cuenta Activada!',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
        <h1 style="color: #d17a3b; text-align: center;">¡Cuenta Activada!</h1>
        <p style="font-size: 16px; text-align: center;">¡Hola ${user.name}!</p>
        <p style="font-size: 16px; text-align: center;">Tu cuenta ha sido activada correctamente.</p>
        <p style="font-size: 16px; text-align: center;">Puedes acceder al sitio con la siguiente contraseña:</p>
        <p style="font-size: 20px; font-weight: bold; text-align: center; color: #d17a3b;">${password}</p>
        <p style="font-size: 16px; text-align: center;">¡Gracias por registrarte!</p>
        <div style="font-size: 24px; text-align: center;">🎉🌟😊</div>
      </div>
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
