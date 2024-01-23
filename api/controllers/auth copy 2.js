// require('dotenv').config();
// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { Resend } = require('resend');
// const User = require('../models/user');

// // Configura Resend con tu clave API
// const resend = new Resend('re_ajRi9chx_KgqR2yLpbpoZUp6dfuj2MrZc');

// exports.signUpAndVerifyEmail = async (req, res, next) => {
//   try {
//     const { email } = req.body;

//     // Verificar si el usuario ya está registrado
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({
//         message: `El correo ${email} se encuentra registrado`,
//       });
//     }

//     // Hash de la contraseña
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);

//     // Crear nuevo usuario
//     const user = new User({
//       _id: new mongoose.Types.ObjectId(),
//       email: req.body.email,
//       password: hashedPassword,
//       name: req.body.name,
//       lastname: req.body.lastname,
//       document: req.body.document,
//       status: 'INACTIVE',
//     });

//     // Guardar el usuario en la base de datos
//     await user.save();

//     // Generar token de verificación
//     const verificationToken = generateVerificationToken(user);

//     // Guardar el token de verificación en el usuario
//     user.emailVerificationToken = verificationToken;
//     user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Válido por 24 horas
//     await user.save();

//     // Enviar el correo electrónico de verificación utilizando Resend
//     const data = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       // to: user.email,
//       to: [user.email],
//       subject: 'Verificación de Correo Electrónico',
//       html: `<p>¡Gracias por registrarte! Haz clic en el siguiente enlace para verificar tu correo electrónico:</p><p><a href="http://localhost:3000/verify/${verificationToken}">Verificar correo electrónico</a></p>`,
//     });

//     // Responder con éxito y el usuario creado
//     res.status(201).json({ message: 'Usuario creado correctamente. Se ha enviado un correo de verificación.', data });
//   } catch (err) {
//     // Manejar errores
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };


// function generateVerificationToken(savedUser) {
//   const secretKey = process.env.JWT_KEY;
//   const expiresIn = '24h';

//   const payload = {
//     userId: savedUser._id,
//   };

//   const verificationToken = jwt.sign(payload, secretKey, { expiresIn });

//   return verificationToken;
// }

// exports.verifyEmail = async (req, res) => {
//   try {
//     const token = req.params.token;

//     // Buscar al usuario por el token de verificación
//     const user = await User.findOne({ emailVerificationToken: token });

//     if (!user) {
//       // Token no válido o usuario no encontrado
//       return res.status(400).json({ message: 'Token de verificación no válido.' });
//     }

//     if (user.emailVerificationExpires < Date.now()) {
//       // Token expirado
//       return res.status(400).json({ message: 'El token de verificación ha expirado.' });
//     }

//     // Actualizar el estado del usuario a "ACTIVE" (o el estado correspondiente)
//     user.status = 'ACTIVE';
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     await user.save();

//     return res.status(200).json({ message: 'Correo electrónico verificado con éxito.' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Error interno del servidor.' });
//   }
// };



// exports.signIn = (req, res, next) => {
//   const { email } = req.body;
//   User.find({ email })
//     .exec()
//     .then(user => {
//       if (user.length < 1) {
//         return res.status(404).json({
//           message: `El correo ${email} no se encuetra registrado`
//         });
//       }
//       bcrypt.compare(req.body.password, user[0].password, (err, result) => {
//         console.log(user[0].password);
//         if (err) {
//           return res.status(500).json({
//             message: "Error Interno, en la validación de la contraseña"
//           });
//         }
//         if (result) {
//           const payload = {
//             email: user[0].email,
//             id: user[0]._id,
//             name: user[0].name,
//             lastname: user[0].lastname,
//             rol: user[0].rol
//           };
//           const token = jwt.sign(
//             payload,
//             process.env.JWT_KEY,
//             { expiresIn: "5h" }
//           );
//           console.log(token)
//           return res.status(200).json({
//             token: token
//           });
//         }
//         res.status(404).json({

//           message: `La contraseña ingresada es incorrecta  -`

//         });
//       });
//     })
//     .catch(err => {
//       res.status(500).json({
//         message: 'Error Interno',
//         error: err,
//         code: 201
//       });
//     });
// };
