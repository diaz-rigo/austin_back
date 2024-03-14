const request = require('request');

const CLIENT = 'AZQBzGIYVGhuQqYpHDogdFPxn2DCDfjb0ZazAOoA-gc3caCvxDJOyrrBqvjVPUWxg5WUXs0K94HfDSK0';
const SECRET = 'EB_FRtODOh3iLf_IzTT7VOACxWFGimWgCDvvZyQfJ1dojDAhwAmYbuvsdbbYY9lWl8m-1O_EKN_UELLT';
const PAYPAL_API = 'https://api-m.sandbox.paypal.com';
// const PAYPAL_API = 'https://sandbox.paypal.com';

const auth = { user: CLIENT, pass: SECRET };
// exports.getAll = (req, res, next) => {
// const paymentController = {
exports.createPayment = (req, res, next) => {
    const body = {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN',
                value: '115'
            }
        }],
        application_context: {
            brand_name: `MiTienda.com`,
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `http://localhost:3000/payment`,
            cancel_url: `http://localhost:3000/payment`
        }
    };

    request.post(`${PAYPAL_API}/v2/checkout/orders`, {
        auth,
        body,
        json: true
    }, (err, response) => {
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
        res.json({ data: response.body });
    });
}
