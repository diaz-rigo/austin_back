const mongoose = require("mongoose");
const request = require('request');

const CLIENT = 'AZQBzGIYVGhuQqYpHDogdFPxn2DCDfjb0ZazAOoA-gc3caCvxDJOyrrBqvjVPUWxg5WUXs0K94HfDSK0';
const SECRET = 'EB_FRtODOh3iLf_IzTT7VOACxWFGimWgCDvvZyQfJ1dojDAhwAmYbuvsdbbYY9lWl8m-1O_EKN_UELLT';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
// const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const auth = { user: CLIENT, pass: SECRET };


const PurchaseDetail = require("../models/purchaseDetail");
const Purchase = require("../models/purchaseSchema");
const User = require("../models/user");


exports.webhook = async (req, res) => {
    const body = req.body;
    console.log(body);
    const paypalOrderId = body.resource.id;

    try {
        const purchase = await Purchase.findOne({ paypalOrderID: paypalOrderId });
        if (!purchase) {
            return res.status(404).send('Purchase not found');
        }

        purchase.status = 'PAID';
        await purchase.save();

        const purchaseDetail = await PurchaseDetail.findById(purchase.details);
        if (!purchaseDetail) {
            return res.status(404).send('Purchase detail not found');
        }
        
        purchaseDetail.status = 'PAID';
        await purchaseDetail.save();

        res.status(200).send('Notification received');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.createPayment = async (req, res, next) => {
    const { totalneto, tipoEntrega, dateselect, productos, datoscliente, instrucion } = req.body;
    const totalAmount = calculateTotalAmount(productos);
    // return_url: `http://localhost:4200/payment/order-success`,
    //         cancel_url: `http://localhost:4200/payment/order-detail?deliveryOption=inStore`,
    //         notify_url: 'https://173d-201-97-146-126.ngrok-free.app/payment/webhook'
    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN',
                value: totalAmount.toString()
            }
        }],
        application_context: {
            brand_name: `austins.vercel.app`,
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `https://austins.vercel.app/payment/order-success`,
            cancel_url: `https://austins.vercel.app/payment/order-detail?deliveryOption=inStore`,
            notify_url: 'https://austin-b.onrender.com/payment/webhook'
        }
    };

    let user = await User.findOne({ email: datoscliente.email });

    if (!user) {
        user = new User({
            _id: new mongoose.Types.ObjectId(),
            name: datoscliente.name,
            paternalLastname: datoscliente.paternalLastname,
            maternalLastname: datoscliente.maternalLastname,
            phone: datoscliente.phone,
            email: datoscliente.email,
            rol: 'GUEST',
            password: 'defaultPassword'
        });
        await user.save();
    }

    let purchaseDetail;

    try {
        const response = await new Promise((resolve, reject) => {
            request.post(`${PAYPAL_API}/v2/checkout/orders`, {
                auth,
                body,
                json: true
            }, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });

        purchaseDetail = new PurchaseDetail({
            _id: new mongoose.Types.ObjectId(),
            user: user._id,
            products: productos.map(producto => ({
                product: producto.id,
                quantity: producto.cantidad
            })),
            totalAmount: totalneto,
            deliveryType: tipoEntrega,
            deliveryDate: dateselect,
            instrucion: instrucion,
            status: 'PENDING'
        });
        await purchaseDetail.save();

        const purchase = new Purchase({
            _id: new mongoose.Types.ObjectId(),
            user: user._id,
            details: purchaseDetail._id,
            totalAmount: totalneto,
            paypalOrderID: response.body.id
        });
        await purchase.save();

        res.json({ data: response.body });
    } catch (error) {
        if (purchaseDetail) {
            purchaseDetail.status = 'PENDING';
            await purchaseDetail.save();
        }
        res.status(500).json({ message: error.message });
    }
}

function calculateTotalAmount(productos) {
    let total = 0;
    productos.forEach(producto => {
        total += producto.precio * producto.cantidad;
    });
    return total.toFixed(2);
}