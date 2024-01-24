require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

"use strict";
const nodemailer = require("nodemailer");



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "morelosalfaro@gmail.com",
    pass: "vvakuhsjgsjulxnb",
  },
});

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
      from: '"Pastelería Austin\'s" <morelosalfaro@gmail.com>',
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
      return res.status(400).json({ message: 'Token de verificación no válido.' });
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
    res.redirect('https://austins.vercel.app'); // Cambia la URL según tu aplicación

    // return res.status(200).json({ message: 'Correo electrónico verificado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



exports.signIn = (req, res, next) => {
  const { email } = req.body;
  User.find({ email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(409).json({
          message: `El correo ${email} no se encuetra registrado`
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        console.log(user[0].password);
        if (err) {
          return res.status(500).json({
            message: "Error Interno, en la validación de la contraseña"
          });
        }
        if (result) {
          const payload = {
            email: user[0].email,
            id: user[0]._id,
            name: user[0].name,
            lastname: user[0].lastname,
            rol: user[0].rol
          };
          const token = jwt.sign(
            payload,
            process.env.JWT_KEY,
            { expiresIn: "5h" }
          );
          console.log(token)
          return res.status(200).json({
            token: token
          });
        }
        res.status(404).json({

          message: `La contraseña ingresada es incorrecta  -`

        });
      });
    })
    .catch(err => {
      res.status(500).json({
        message: 'Error Interno',
        error: err,
        code: 201
      });
    });
};
