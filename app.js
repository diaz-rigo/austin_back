const express = require('express');
const app = express();
require('dotenv').config()
const morgan = require('morgan');
const mongoose = require('mongoose');
function logRequest(req, res, next) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
}
const authRoutes = require('./api/routes/auth');
const userRoutes = require('./api/routes/user');
const categoryRoutes = require('./api/routes/category');
const productRoutes = require('./api/routes/product');
const tokenRoutes = require('./api/routes/token');
const pushSubscription = require('./api/routes/pushSubscription');
const paymentRoutes = require('./api/routes/payment');
const paymentStripeRoutes = require('./api/routes/paymentStripe');
const paymentMercadoRoutes = require('./api/routes/paymentMercado');
const orderRoutes = require('./api/routes/order');
const perfil = require('./api/routes/edit_profile');
const tareasController = require('./api/controllers/tareas');
const ADMINREPORT = require('./api/routes/adminReport');
const PUBLICREPORT = require('./api/routes/publicReport');
const alexa = require('./api/routes/alexa');
const Review = require('./api/routes/review');
const modelo = require('./api/routes/model');
const contact= require('./api/routes/contactRoutes');
const faqs= require('./api/routes/faqRoutes');
const feedback= require('./api/routes/feedbackRoutes');

const url = 'mongodb+srv://20211036:' +  process.env.MONGO_ATLAS_PW   + '@cluster0.6qjq7cq.mongodb.net/'
    mongoose.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => {
    console.log('Conexión ak MongoDB exitosa');
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err.message);
  });
mongoose.Promise = global.Promise;

app.use(morgan('dev'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        return res.status(200).json({})
    }
    next();
}); 

app.use('/uploads', express.static('uploads'));
app.use(express.json());
// Middleware de registro

// Utilizar el middleware de registro
app.use(logRequest);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/category', categoryRoutes);
app.use('/product', productRoutes);
app.use('/token', tokenRoutes);
app.use('/pushSubscription', pushSubscription);
app.use('/payment', paymentRoutes);
app.use('/stripe', paymentStripeRoutes);
app.use('/mercado', paymentMercadoRoutes);
app.use('/order', orderRoutes);
app.use('/perfil', perfil);
app.use('/admin', ADMINREPORT);
app.use('/publicR', PUBLICREPORT);
app.use('/alexa', alexa);
app.use('/review', Review);
app.use('/modelo', modelo);
app.use('/contact', contact);
app.use('/faqs', faqs);
app.use('/feedback', feedback);

app.use((req, res, next) => {
    const error = new Error(' error Not found 12 01 2024');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});
module.exports = app;