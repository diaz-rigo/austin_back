// const cron = require('node-cron');
// const Purchase = require('../models/purchaseDetail');
// const Product = require('../models/product');
// const nodemailer = require("nodemailer");
// const User = require("../models/user");

// // Configuración del transporte del correo
// "use strict";
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true,
//     auth: {
//         user: process.env.USER,
//         pass: process.env.PASSMAIL,
//     },
// });

// // Programa la tarea cron para ejecutarse cada minuto
// cron.schedule('* * * * *', async () => {
//     console.log('Running a task every minute');

//     try {
//         const pendingPurchases = await Purchase.find({ status: 'PENDING' }).populate('user').populate('products.product');

//         pendingPurchases.forEach(async (purchase) => {
//             console.log('Detalles de la compra:');
//             console.log(purchase);
//             console.log('--------------------------------------');

//             const user = purchase.user; // Accede al objeto de usuario relacionado
//             const userEmail = user.email; // Utiliza la dirección de correo electrónico del usuario
//             const userName = `${user.name} ${user.paternalLastname} ${user.maternalLastname}`; // Nombre completo del usuario

//             console.log('Correo electrónico del usuario:', userEmail);

//             // Obtener el primer producto en la compra pendiente
//             const firstProduct = purchase.products[0];

//             // Obtener detalles del producto
//             const productDetails = await Product.findById(firstProduct.product);
//             const htmlMessage = `
//   <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
//     <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
//       <div style="text-align: center; padding: 20px;">
//         <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
//       </div>
//       <div style="text-align: center; padding: 20px;">
//         <h2 style="font-size: 24px; color: #ff5733;">Compra Pendiente</h2>
//         <p style="color: #555; font-size: 16px;">Hola ${userName},</p>
//         <div style="text-align: center; padding: 10px; background-color: #ffffff; color: #ff5733;">
//           <p style="font-size: 14px; font-weight: bold;">Detalles de la Entrega:</p>
//           <p style="font-size: 14px;">Tipo de entrega: ${purchase.deliveryType}</p>
//           <p style="font-size: 14px;">Fecha de entrega: ${purchase.deliveryDate}</p>
//           <p style="font-size: 14px;">Instrucciones: ${purchase.instrucion}</p>
//           <p style="font-size: 14px;">Total: ${purchase.totalAmount}</p>
//         </div>
//         <p style="color: #555; font-size: 16px;">Se encontró una compra pendiente en tu cuenta. A continuación, se detalla el primer producto:</p>
//         <p style="font-size: 16px;">Nombre del Producto: ${productDetails.name}</p>
//         <img src="${productDetails.images[0]}" alt="${productDetails.name}" style="max-width: 200px; margin: 0 auto;">
//         <div style="margin-top: 20px;">
//           <a href="https://austins.vercel.app/portal/detail/${productDetails._id}" style="background-color: #ff5733; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Ver Detalles del Producto</a>
//         </div>
//       </div>
//     </div>
//   </div>
// `;

//             // Envía un correo electrónico notificando sobre las compras pendientes con los detalles del pedido y el nombre del usuario
//             await transporter.sendMail({
//                 from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
//                 to: userEmail,
//                 subject: 'Compra Pendiente',
//                 html: htmlMessage
//             });
//         });
//     } catch (error) {
//         console.error('Error al realizar la consulta:', error);
//         // En caso de error, envía un correo electrónico notificando sobre el error
//         await transporter.sendMail({
//             from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
//             to: '20211036@uthh.edu.mx',
//             subject: 'Error al buscar compras pendientes',
//             text: 'Se ha producido un error al buscar compras pendientes:\n' + error
//         });
//     }
// });
