require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const crypto = require('crypto');
const MAX_LOGIN_ATTEMPTS = 5; // Define el número máximo de intentos de inicio de sesión permitidos antes de bloquear la cuenta del usuario

"use strict";
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "morelosalfaro@gmail.com",
//     pass: "vvakuhsjgsjulxnb",
//   },
// });
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "austins0271142@gmail.com",
    pass: "trqohqbbaleonmta",
  },
});


// {"message":"Token de verificación no válido."}
function generateVerificationCode() {
  // Generar un código de verificación, por ejemplo, un número aleatorio de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function saveVerificationCode(user, verificationCode) {
  try {
    console.log('Usuario antes de guardar:', user);
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 5 * 60 * 1000; // Válido por 5 minutos
    await user.save();
    console.log('Usuario después de guardar:', user);
  } catch (error) {
    console.error('Error al guardar el código de verificación:', error);
  }
}



async function sendRecoveryEmailWithCode(user, verificationCode) {
  const mailOptions = {
    from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
    to: user.email,
    subject: 'Recuperación de Contraseña - Pastelería Austin\'s',
    html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding: 20px;">
            <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
          </div>
          <div style="text-align: center; padding: 20px;">
            <h2 style="font-size: 24px; color: #333;">Recuperación de Contraseña</h2>
            <p style="color: #555; font-size: 16px;">Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
            <p style="font-size: 32px; color: #ff5733; font-weight: bold;">${verificationCode}</p>
          </div>
          <p style="text-align: center; color: #777; font-size: 14px;">Si no has solicitado este cambio, por favor ignora este correo electrónico.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}


exports.requestPasswordRecovery = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const verificationCode = generateVerificationCode();

    // Guardar el código de verificación en el usuario
    await saveVerificationCode(user, verificationCode);

    // Enviar correo de recuperación de contraseña con el código de verificación
    await sendRecoveryEmailWithCode(user, verificationCode);

    res.status(200).json({ message: 'Correo de recuperación de contraseña enviado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.verifyCodeAndResetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;
    console.log(email, verificationCode, newPassword)
    const user = await User.findOne({ email, verificationCode });

    if (!user || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Código de verificación no válido o ha expirado.' });
    }

    // Actualizar la contraseña y limpiar el código de verificación
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.', details: error.message || error, stack: error.stack });
  }
  
};



exports.verificationcode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Buscar al usuario por correo electrónico y código de verificación
    const user = await User.findOne({ email, verificationCode });

    if (!user || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Código de verificación no válido o ha expirado.' });
    }

    // Limpiar el código de verificación (puedes omitir esto si no lo necesitas)
    // user.verificationCode = undefined;
    // user.verificationCodeExpires = undefined;
    // await user.save();

    res.status(200).json({ message: 'Código de verificación verificado con éxito.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



exports.signUpAndVerifyEmail = async (req, res, next) => {
  try {

      const { email, securityQuestion, securityAnswer, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: `El correo ${email} se encuentra registrado`,
      });
    }
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    // Crear nuevo usuario
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      maternalLastname: req.body.maternalLastname,
      paternalLastname: req.body.paternalLastname,
      document: req.body.document,
      status: 'INACTIVE',
      securityQuestion,
      securityAnswer,
      phone, // Agregando el campo de teléfono

    });

    // Guardar el usuario en la base de datos
    await user.save();

    // Generar token de verificación
    const verificationToken = generateVerificationToken(user);

    // Guardar el token de verificación en el usuario
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Válido por 24 horas
    await user.save();


    const mailOptions = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: user.email,
      subject: 'Verificación de Correo Electrónico - Pastelería Austin\'s',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; padding: 20px;">
              <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
            </div>
            <div style="text-align: center; padding: 20px;">
              <h2 style="font-size: 24px; color: #333;">¡Gracias por registrarte en Pastelería Austin's!</h2>
              <p style="color: #555; font-size: 16px;">Haz clic en el siguiente enlace para verificar tu correo electrónico y comenzar a disfrutar de nuestros servicios:</p>
              <a href="https://austin-b.onrender.com/auth/verify/${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #ff5733; color: #fff; text-decoration: none; border-radius: 5px;">Verificar correo electrónico</a>
            </div>
            <p style="text-align: center; color: #777; font-size: 14px;">Si no has solicitado este correo, puedes ignorarlo de manera segura.</p>
          </div>
        </div>
      `,
    };

    // const mailOptions = {
      // from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
    //   to: user.email,
    //   subject: 'Verificación de Correo Electrónico - Pastelería Austin\'s',
    //   html: `
    //     <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
    //       <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
    //         <div style="text-align: center; padding: 20px;">
    //           <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
    //         </div>
    //         <div style="text-align: center; padding: 20px;">
    //           <h2 style="font-size: 24px; color: #333;">¡Gracias por registrarte en Pastelería Austin's!</h2>
    //           <p style="color: #555; font-size: 16px;">Haz clic en el siguiente enlace para verificar tu correo electrónico y comenzar a disfrutar de nuestros servicios:</p>
    //           <a href="http://localhost:3000/auth/verify/${verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #ff5733; color: #fff; text-decoration: none; border-radius: 5px;">Verificar correo electrónico</a>
    //         </div>
    //         <p style="text-align: center; color: #777; font-size: 14px;">Si no has solicitado este correo, puedes ignorarlo de manera segura.</p>
    //       </div>
    //     </div>
    //   `,
    // };
    

    await transporter.sendMail(mailOptions);

    // Responder con éxito y el usuario creado
    res.status(201).json({ message: 'Usuario creado correctamente. Se ha enviado un correo de verificación.' });
  } catch (err) {
    // Manejar errores
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

function generateVerificationToken(savedUser) {
  const secretKey = process.env.JWT_KEY;
  const expiresIn = '24h';

  const payload = {
    userId: savedUser._id,
  };
  const verificationToken = jwt.sign(payload, secretKey, { expiresIn });
  return verificationToken;
}

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token;

    // Buscar al usuario por el token de verificación
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      // Token no válido o usuario no encontrado
      return res.redirect('https://austins.vercel.app/auth/error-verificacion');
    }

    if (user.emailVerificationExpires < Date.now()) {
      // Token expirado
      return res.status(400).json({ message: 'El token de verificación ha expirado.' });
    }

    // Actualizar el estado del usuario a "ACTIVE" (o el estado correspondiente)
    user.status = 'ACTIVE';
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Generar token de autenticación
    const payload = {
      email: user.email,
      id: user._id,
      name: user.name,
      lastname: user.lastname,
      rol: user.rol
    };
    const authToken = jwt.sign(
      payload,
      process.env.JWT_KEY,
      { expiresIn: '5h' }
    );
    // Redirigir al usuario con el token de autenticación incluido en la URL
    // return res.redirect(`http://localhost:4200/auth/success?token=${authToken}`);
    return res.redirect(`https://austins.vercel.app/auth/success?token=${authToken}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  } 
};


exports.signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: `El correo ${email} no se encuentra registrado` });
    }

    // Verificar si la cuenta está bloqueada temporalmente
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(403).json({ message: 'La cuenta está bloqueada temporalmente. Por favor, inténtalo de nuevo más tarde.' });
    }

    // Utilizar una promesa para bcrypt.compare
    const result = await new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    if (result) {
      // Restablecer el contador de intentos de inicio de sesión fallidos
      user.loginAttempts = 0;
      user.lockoutUntil = null; // Restablecer el bloqueo temporal
      await user.save();
      // Generar y devolver el token de autenticación
      const token = generateAuthToken(user);
      return res.status(200).json({ token });
    } else {
      // Incrementar el contador de intentos de inicio de sesión fallidos
      user.loginAttempts++;
      await user.save();
      // Verificar si se ha excedido el límite de intentos de inicio de sesión
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        // Bloquear temporalmente la cuenta por un periodo de tiempo (por ejemplo, 30 minutos)
        const lockoutDuration = 30 * 60 * 1000; // 30 minutos en milisegundos
        user.lockoutUntil = new Date(Date.now() + lockoutDuration);
        await user.save();
        const mailOptions = {
          from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
          to: user.email,
          subject: 'Notificación de Bloqueo Temporal de Cuenta - Pastelería Austin\'s',
          html: `
            <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; padding: 20px;">
                  <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
                </div>
                <div style="text-align: center; padding: 0 20px;">
                  <h2 style="font-size: 24px; color: #333; margin-bottom: 20px;">¡Hola ${user.name}!</h2>
                  <p style="color: #555; font-size: 16px; margin-bottom: 15px;">Hemos detectado varios intentos fallidos de inicio de sesión en tu cuenta de Pastelería Austin's.</p>
                  <p style="color: #555; font-size: 16px; margin-bottom: 15px;">Por razones de seguridad, hemos bloqueado temporalmente tu cuenta. Por favor, espera un momento y luego intenta iniciar sesión nuevamente.</p>
                  <p style="color: #555; font-size: 16px; margin-bottom: 25px;">Si has olvidado tu contraseña, puedes restablecerla haciendo clic <a href="https://austins.vercel.app/auth/Recupera" style="color: #ff5733; text-decoration: none;">aquí</a>.</p>
                </div>
                <p style="text-align: center; color: #777; font-size: 14px; margin-top: 20px; margin-bottom: 0;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
                <p style="text-align: center; color: #777; font-size: 14px; margin-top: 5px;">Si no has solicitado este correo, puedes ignorarlo de manera segura.</p>
              </div>
            </div>
          `,
        };
        
        await transporter.sendMail(mailOptions);
        


        return res.status(403).json({ message: 'Se ha excedido el límite de intentos de inicio de sesión. La cuenta ha sido bloqueada temporalmente.' });
      } else {
        return res.status(404).json({ message: 'La contraseña ingresada es incorrecta' });
      }
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};



function generateAuthToken(user) {
  if (!user) {
    throw new Error('No se ha encontrado ningún usuario');
  }

  const payload = {
    email: user.email,
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    rol: user.rol
    // Otros datos del usuario que desees incluir en el token
  };

  const secretKey = process.env.JWT_KEY;
  const expiresIn = '5h'; // El token expira en 5 horas, puedes ajustar esto según tus necesidades

  return jwt.sign(payload, secretKey, { expiresIn });
}
