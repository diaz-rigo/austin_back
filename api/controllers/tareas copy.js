// const cron = require('node-cron');
// // const Purchase = require('../models/purchaseSchema');
// // const PurchaseDetail = require('../models/purchaseDetail');
// const VentaDetail = require("../models/ventaDetail");
// const Venta = require("../models/ventaSchema");
// const Product = require('../models/product');
// const nodemailer = require("nodemailer");
// const User = require("../models/user");
// const Pedido = require('../models/order');
// const PedidoDetalle = require('../models/orderDetail');
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

// const emailsEnviados = {};

// // Programa la tarea cron para ejecutarse cada 30 segundos
// cron.schedule('*/30 * * * * *', async () => {
//     console.log('Running a task every 30 seconds');

//     try {
//         // Busca un usuario con el rol "ADMIN"
//         const adminUser = await User.findOne({ rol: 'ADMIN' });

//         // Si se encuentra un usuario con el rol "ADMIN"
//         if (adminUser) {
//             console.log('Usuario con rol ADMIN encontrado:');

//             // Calcula la fecha de hace 5 minutos
//             const fechaActual = new Date();
//             const fechaLimite = new Date(fechaActual.getTime() - 5 * 60000); // 5 minutos antes

//             // Busca los pedidos creados en los últimos 5 minutos
//             const pedidosRecientes = await Pedido.find({ createdAt: { $gte: fechaLimite } });

//             // Filtra los pedidos que no tienen un correo electrónico enviado registrado
//             const pedidosSinCorreoEnviado = pedidosRecientes.filter(pedido => !emailsEnviados[pedido._id.toString()]);

//             // Si hay pedidos recientes sin correo electrónico enviado, notifica al administrador por correo electrónico
//             if (pedidosSinCorreoEnviado.length > 0) {
//                 // Construye el cuerpo del correo
//                 const mailOptions = {
//                     from: process.env.USER,
//                     to: adminUser.email,
//                     subject: 'Notificación de Pedidos Recientes',
//                     text: `Hola ${adminUser.name}, hay ${pedidosSinCorreoEnviado.length} pedidos recientes. Por favor, revíselos en el sistema.`
//                 };

//                 // Envía el correo electrónico
//                 transporter.sendMail(mailOptions, function(error, info){
//                     if (error) {
//                         console.error('Error al enviar el correo electrónico:', error);
//                     } else {
//                         console.log('Correo electrónico enviado:', info.response);
//                         // Registra los pedidos a los que se ha enviado correo electrónico
//                         pedidosSinCorreoEnviado.forEach(pedido => {
//                             emailsEnviados[pedido._id.toString()] = true;
//                         });
//                     }
//                 });
//             } else {
//                 console.log('No hay pedidos recientes sin correo electrónico enviado en este momento.');
//             }
//         } else {
//             console.log('No se encontró ningún usuario con rol ADMIN');
//         }

//     } catch (error) {
//         console.error('Error al buscar usuario con rol ADMIN o pedidos recientes:', error);
//         // Manejo de errores aquí...
//     }
// });



// // Programa la tarea cron para ejecutarse cada minuto
// // cron.schedule('* * * * *', async () => {
    
// cron.schedule('0 * * * *', async () => {

//     // cron.schedule('0 0 * * *', async () => {
//     console.log('Running a task every minute');

//     try {
//         const ventasPendientes = await VentaDetail.find({ status: 'PENDING' }).populate('user').populate('products.product');

//         ventasPendientes.forEach(async (ventaDetail) => {
//             console.log('Detalles de la compra:');
//             console.log(ventaDetail);
//             console.log('--------------------------------------');

//             const user = ventaDetail.user; // Accede al objeto de usuario relacionado
//             const userEmail = user.email; // Utiliza la dirección de correo electrónico del usuario
//             const userName = `${user.name} ${user.paternalLastname} ${user.maternalLastname}`; // Nombre completo del usuario

//             console.log('Correo electrónico del usuario:', userEmail);

//             // Obtener el detalle de la compra
//             const venta = await Venta.findOne({ details: ventaDetail._id });

//             // Construir el cuerpo del mensaje HTML con los detalles de la compra y el nombre del usuario
//             // Construir el cuerpo del mensaje HTML con los detalles de la compra y el nombre del usuario
//             const htmlMessage = `
//     <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
//         <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
//             <div style="text-align: center; padding: 20px;">
//                 <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
//             </div>
//             <div style="text-align: center; padding: 20px;">
//                 <h2 style="font-size: 24px;">¡Compra Pendiente!</h2>
//                 <p style="color: #555; font-size: 16px;">Hola ${userName},</p>
//                 <div style="background-color: #ffffff; color: #ff5733; border-radius: 5px; padding: 10px; margin-bottom: 20px;">
//                     <p style="font-size: 14px; font-weight: bold;">Detalles de la Entrega:</p>
//                     <p style="font-size: 14px;">Tipo de entrega: ${ventaDetail.deliveryType}</p>
              
//                 </div>
//                 <p style="color: #555; font-size: 16px;">Tenemos una compra pendiente en tu cuenta. Aquí está el primer producto:</p>
//                 <a href="https://austins.vercel.app/portal/detail/${ventaDetail.products[0].product._id}" style="background-color: #ff5733; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Ver Detalles del Producto</a>
//                 <p style="font-size: 16px;">Nombre del Producto: ${ventaDetail.products[0].product.name}</p>
//                 <img src="${ventaDetail.products[0].product.images[0]}" alt="${ventaDetail.products[0].product.name}" style="max-width: 200px; margin: 0 auto; display: block; margin-bottom: 10px;">
//                 <p style="font-size: 14px;">ID de la Compra: ${venta.trackingNumber}</p>
//                 <div style="margin-top: 20px;">
                
//                     <a  style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-left: 10px;">Ir a Seguimiento de Pedido</a>
//                 </div>
//             </div>
//         </div>
//     </div>
//     `;


//             // Envía un correo electrónico notificando sobre las compras pendientes con los detalles del pedido y el nombre del usuario
//             await transporter.sendMail({
//                 from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
//                 to: userEmail,
//                 subject: '¡Tienes una Compra Pendiente!',
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
