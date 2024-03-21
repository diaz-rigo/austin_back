const cron = require('node-cron');
const Purchase = require('../models/purchaseSchema');
const PurchaseDetail = require('../models/purchaseDetail');
const Product = require('../models/product');
const nodemailer = require("nodemailer");
const User = require("../models/user");

// Configuración del transporte del correo
"use strict";
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER,
        pass: process.env.PASSMAIL,
    },
});

// Programa la tarea cron para ejecutarse cada minuto
cron.schedule('* * * * *', async () => {
// cron.schedule('0 0 * * *', async () => {

    console.log('Running a task every minute');

    try {
        const pendingPurchases = await PurchaseDetail.find({ status: 'PENDING' }).populate('user').populate('products.product');

        pendingPurchases.forEach(async (purchaseDetail) => {
            console.log('Detalles de la compra:');
            console.log(purchaseDetail);
            console.log('--------------------------------------');

            const user = purchaseDetail.user; // Accede al objeto de usuario relacionado
            const userEmail = user.email; // Utiliza la dirección de correo electrónico del usuario
            const userName = `${user.name} ${user.paternalLastname} ${user.maternalLastname}`; // Nombre completo del usuario

            console.log('Correo electrónico del usuario:', userEmail);

            // Obtener el detalle de la compra
            const purchase = await Purchase.findOne({ details: purchaseDetail._id });

            // Construir el cuerpo del mensaje HTML con los detalles de la compra y el nombre del usuario
            // Construir el cuerpo del mensaje HTML con los detalles de la compra y el nombre del usuario
            const htmlMessage = `
<div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; padding: 20px;">
            <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
        </div>
        <div style="text-align: center; padding: 20px;">
            <h2 style="font-size: 24px; color: #ff5733;">¡Compra Pendiente!</h2>
            <p style="color: #555; font-size: 16px;">Hola ${userName},</p>
            <div style="background-color: #ffffff; color: #ff5733; border-radius: 5px; padding: 10px; margin-bottom: 20px;">
                <p style="font-size: 14px; font-weight: bold;">Detalles de la Entrega:</p>
                <p style="font-size: 14px;">Tipo de entrega: ${purchaseDetail.deliveryType}</p>
                <p style="font-size: 14px;">Total: ${purchaseDetail.totalAmount}</p>
            </div>
            <p style="color: #555; font-size: 16px;">Tenemos una compra pendiente en tu cuenta. Aquí está el primer producto:</p>
            <a href="https://austins.vercel.app/portal/detail/${purchaseDetail.products[0].product._id}" style="background-color: #ff5733; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Ver Detalles del Producto</a>
            <p style="font-size: 16px;">Nombre del Producto: ${purchaseDetail.products[0].product.name}</p>
            <img src="${purchaseDetail.products[0].product.images[0]}" alt="${purchaseDetail.products[0].product.name}" style="max-width: 200px; margin: 0 auto; display: block; margin-bottom: 10px;">
            <p style="font-size: 14px;">ID de la Compra: ${purchase.paypalOrderID}</p>
            <div style="margin-top: 20px;">
            
                <a  style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-left: 10px;">Ir a Seguimiento de Pedido</a>
            </div>
        </div>
    </div>
</div>
`;
            {/* <a href="https://austins.vercel.app/portal/track/${purchase._id}" style="background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px; margin-left: 10px;">Ir a Seguimiento de Pedido</a> */ }

            // Envía un correo electrónico notificando sobre las compras pendientes con los detalles del pedido y el nombre del usuario
            await transporter.sendMail({
                from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
                to: userEmail,
                subject: '¡Tienes una Compra Pendiente!',
                html: htmlMessage
            });
        });
    } catch (error) {
        console.error('Error al realizar la consulta:', error);
        // En caso de error, envía un correo electrónico notificando sobre el error
        await transporter.sendMail({
            from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
            to: '20211036@uthh.edu.mx',
            subject: 'Error al buscar compras pendientes',
            text: 'Se ha producido un error al buscar compras pendientes:\n' + error
        });
    }
});
