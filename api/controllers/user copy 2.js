// const mongoose = require("mongoose");
// const User = require("../models/user");
// // const { Resend } = require("resend"); // Asegúrate de importar Resend correctamente
// const jwt = require('jsonwebtoken');
// const { Resend } = require("resend");

// // Configura Resend con tu clave API
// // const resend = new Resend('re_cF4Fy2Uj_NBVgpDw7TrW8T6mVjr9an4dr');
// // Configura Resend con tu clave API
// const resend = new Resend('re_cF4Fy2Uj_NBVgpDw7TrW8T6mVjr9an4dr');

// exports.create = async (req, res, next) => {
//     // Crear un nuevo usuario
//     const user = new User({
//         _id: new mongoose.Types.ObjectId(),
//         email: req.body.email,
//         password: req.body.password,
//         rol: req.body.rol,
//         name: req.body.name,
//         lastname: req.body.lastname,
//         status: 'INACTIVE', // Cambiado a 'INACTIVE' hasta que se verifique el correo electrónico
//     });

//     try {
//         // Guardar el usuario en la base de datos
//         const savedUser = await user.save();

//         // Generar un token de verificación
//         const verificationToken = generateVerificationToken(savedUser);

//         // Guardar el token de verificación en el usuario
//         savedUser.emailVerificationToken = verificationToken;
//         savedUser.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // Válido por 24 horas
//         await savedUser.save();

//         // // Enviar el correo electrónico de verificación utilizando Resend
//         // await resend.send({
//         //     to: savedUser.email,
//         //     subject: 'Verificación de Correo Electrónico',
//         //     html: `<p>¡Gracias por registrarte! Haz clic en el siguiente enlace para verificar tu correo electrónico:</p><p><a href="http://tu_app.com/verify/${verificationToken}">Verificar correo electrónico</a></p>`,
//         // });
//         // Enviar el correo electrónico de verificación utilizando Resend
//         await resend.send({
//             to: savedUser.email,
//             subject: 'Verificación de Correo Electrónico',
//             html: `<p>¡Gracias por registrarte! Haz clic en el siguiente enlace para verificar tu correo electrónico:</p><p><a href="http://localhost:3000/verify/${verificationToken}">Verificar correo electrónico</a></p>`,
//         });

//         // Responder con éxito y el usuario creado
//         res.status(201).json(savedUser);
//     } catch (err) {
//         // Manejar errores
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// };

// function generateVerificationToken(savedUser) {
//     // Lógica para generar un token único utilizando JWT
//     const secretKey = process.env.JWT_KEY;
//     const expiresIn = '24h'; // Válido por 24 horas

//     // Puedes incluir información adicional en el token si es necesario
//     const payload = {
//         userId: savedUser._id,
//     };

//     // Genera el token utilizando jwt.sign
//     const verificationToken = jwt.sign(payload, secretKey, { expiresIn });

//     return verificationToken;
// }


// // Lógica para verificar el correo electrónico
// exports.verifyEmail = async (req, res) => {
//     try {
//         const token = req.params.token;

//         // Buscar al usuario por el token de verificación
//         const user = await User.findOne({ emailVerificationToken: token });

//         if (!user) {
//             // Token no válido o usuario no encontrado
//             return res.status(400).json({ message: 'Token de verificación no válido.' });
//         }

//         if (user.emailVerificationExpires < Date.now()) {
//             // Token expirado
//             return res.status(400).json({ message: 'El token de verificación ha expirado.' });
//         }

//         // Actualizar el estado del usuario a "ACTIVE" (o el estado correspondiente)
//         user.status = 'ACTIVE';
//         user.emailVerificationToken = undefined;
//         user.emailVerificationExpires = undefined;
//         await user.save();

//         return res.status(200).json({ message: 'Correo electrónico verificado con éxito.' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: 'Error interno del servidor.' });
//     }
// };



// // Resto del código...

// // Resto del código...

// exports.getAll = (req, res, next) => {
//   User.find()
//       .exec()
//       .then(docs => {
//           res.status(200).json(docs)
//       })
//       .catch(err => {
//           res.status(500).json({ error: err });
//       });
// };

// exports.get = (req, res, next) => {
//   User.findById(req.params.id)
//     .exec()
//     .then(doc => {
//       if (!doc) {
//         return res.status(404).json({ message: "Not found" });
//       }
//       res.status(200).json(doc);
//     })
//     .catch(err => {
//       res.status(500).json({ error: err });
//     });
// };

// exports.update = (req, res, next) => {
//     const _id = req.params.id;
//     const body = {
//         email: req.body.email,
//         name: req.body.name,
//         lastname: req.body.lastname,
//         rol: req.body.rol,
//         document: req.body.document
//     };
//     User.findOneAndUpdate({ _id: _id }, { $set: body }, {new: true})
//       .exec()
//       .then(doc => {
//         res.status(200).json(doc);
//       })
//       .catch(err => {
//         res.status(500).json({ error: err });
//       });
// };

// exports.delete = (req, res, next) => {
//     const _id = req.params.id;
//     User.deleteOne({ _id: _id })
//         .exec()
//         .then(result => {
//             res.status(200).json({
//                 _id: _id,
//             });
//         })
//         .catch(err => {
//             res.status(500).json({ error: err });
//         });
// };

