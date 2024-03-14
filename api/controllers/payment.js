const request = require('request');

const CLIENT = 'AZQBzGIYVGhuQqYpHDogdFPxn2DCDfjb0ZazAOoA-gc3caCvxDJOyrrBqvjVPUWxg5WUXs0K94HfDSK0';
const SECRET = 'EB_FRtODOh3iLf_IzTT7VOACxWFGimWgCDvvZyQfJ1dojDAhwAmYbuvsdbbYY9lWl8m-1O_EKN_UELLT';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
// const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
const auth = { user: CLIENT, pass: SECRET };

exports.createPayment = (req, res, next) => {
    const { totalneto, tipoEntrega, dateselect, productos, datoscliente, instruction } = req.body;

    const totalAmount = calculateTotalAmount(productos); // Function to calculate total amount based on products

    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN',
                value: totalAmount.toString() // Convert total amount to string
            }
        }],
        application_context: {
            brand_name: `austins.vercel.app`,
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `http://localhost:3000/payment/`, // Change return URL
            cancel_url: `http://localhost:3000/payment/` // Change cancel URL
        }
    };

    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body,
        json: true
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.json({ data: response.body });
    });
}


exports.executePayment = (req, res, next) => {
    const token = req.query.token;

    request.post(`${PAYPAL_API}/v2/checkout/orders/${token}/capture`, {
        auth,
        body: {},
        json: true
    }, (err, response) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        res.status(200).json({ message: "Pago ejecutado exitosamente." });
    });
}


function calculateTotalAmount(productos) {
    let total = 0;
    productos.forEach(producto => {
        total += producto.precio * producto.cantidad;
    });
    return total.toFixed(2); // Return total amount with two decimal places
}
