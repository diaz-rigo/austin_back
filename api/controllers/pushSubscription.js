const mongoose = require("mongoose");
const PushSubscription = require("../models/pushSubscription");
const webpush = require('web-push');
const User = require('../models/user');
// Configurar las claves VAPID
const vapidKeys = {
    publicKey: "BFYtOg9-LQWHmObZKXm4VIV2BImn5nBrhz4h37GQpbdj0hSBcghJG7h-wldz-fx9aTt7oaqKSS3KXhA4nXf32pY",
    privateKey: "daiRV8XPPoeSHC4nZ5Hj6yHr98saYGlysFAuEJPypa0"
};

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);
// Crear una nueva suscripción
// Create a new subscription
// Crear una nueva suscripción o actualizar si ya existe
exports.createSubscription2 = (req, res, next) => {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
        return res.status(400).json({ error: 'Subscription and userId are required' });
    }

    // Buscar si ya existe la suscripción
    PushSubscription.findOne({ endpoint: subscription.endpoint })
        .then(existingSubscription => {
            if (existingSubscription) {
                // Si ya existe, agregar el ID de la suscripción al array de suscripciones del usuario
                return User.findByIdAndUpdate(userId, { $addToSet: { subscriptions: existingSubscription._id } })
                    .then(() => {
                           // Enviar la notificación de inicio de sesión
                        enviarNotificacionLogeo(subscription);
                        res.status(200).json({ message: 'Subscription already exists', subscriptionId: existingSubscription._id });
                    });
            } else {
                // Si no existe, crear una nueva suscripción
                const newSubscription = new PushSubscription({
                    _id: new mongoose.Types.ObjectId(),
                    endpoint: subscription.endpoint,
                    keys: subscription.keys
                });

                return newSubscription.save()
                    .then(savedSubscription => {
                        // Agregar el ID de la nueva suscripción al array de suscripciones del usuario
                        return User.findByIdAndUpdate(userId, { $addToSet: { subscriptions: savedSubscription._id } })
                            .then(() => {
                                // Enviar la notificación de inicio de sesión
                                enviarNotificacionLogeo(subscription);
                                res.status(201).json({ message: 'Subscription created successfully', subscriptionId: savedSubscription._id });
                            });
                    });
            }
        })
        .catch(err => {
            console.error('Error en createSubscription2:', err);
            res.status(500).json({ error: err.message });
        });
};

// const PushSubscription = require('../models/PushSubscription');  // Adjust the path as per your project structure


exports.createSubscription = (req, res, next) => {
    const { endpoint, keys } = req.body;

    PushSubscription.findOne({ endpoint: endpoint })
        .then(existingSubscription => {
            if (existingSubscription) {
                // Subscription already exists, send welcome notification directly
                // enviarNotificacionBienvenida(existingSubscription);
                return res.status(200).json(existingSubscription);
            } else {
                // Create a new subscription
                const pushSubscription = new PushSubscription({
                    _id: new mongoose.Types.ObjectId(),
                    endpoint: endpoint,
                    keys: keys
                });

                pushSubscription.save()
                    .then(result => {
                        // Envía la notificación de bienvenida
                        enviarNotificacionBienvenida(pushSubscription);
                        res.status(201).json(result);
                    })
                    .catch(err => {
                        res.status(500).json({ error: err });
                    });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};


function enviarNotificacionBienvenida(subscription) {
    // https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830998/sound/clmb7pi3g12frwqzn3vx.mp3
    const payload = {
        notification: {
            title: "😋🍰 Bienvenido a Austins Repostería-",
            body: " Descubre nuestras deliciosas creaciones.",
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [200, 50, 200],
            sound: "https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830998/sound/clmb7pi3g12frwqzn3vx.mp3",
            actions: [{
                action: "explore",
                title: "Ver nuestras especialidades",
                url: "https://austins.vercel.app"
            }]
        }
    };
    
    // https://austins.vercel.app/portal/home
    webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => {
            console.log('Notificación de bienvenida enviada con éxito');
        })
        .catch(err => {
            console.error('Error al enviar notificación de bienvenida:', err);
        });
}
function enviarNotificacionLogeo(subscription) {
    const payload = {
        notification: {
            title: "¡Inicio de sesión exitoso!",
            body: "Gracias por iniciar sesión en Austins Repostería. Descubre nuestras deliciosas creaciones.",
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [200, 50, 200],
            sound: "https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830998/sound/clmb7pi3g12frwqzn3vx.mp3",
            actions: [{
                action: "explore",
                title: "Ver nuestras especialidades",
                url: "https://austins.vercel.app"
            }]
        }
    };
    
    webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => {
            console.log('Notificación de inicio de sesión enviada con éxito');
        })
        .catch(err => {
            console.error('Error al enviar notificación de inicio de sesión:', err);
        });
}

// Obtener todas las suscripciones
exports.getAllSubscriptions = (req, res, next) => {
    PushSubscription.find()
        .exec()
        .then(subscriptions => {
            res.status(200).json(subscriptions);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};



// Obtener una suscripción por ID
exports.getSubscription = (req, res, next) => {
    const subscriptionId = req.params.id;

    PushSubscription.findById(subscriptionId)
        .exec()
        .then(subscription => {
            if (!subscription) {
                return res.status(404).json({ message: "Subscription not found" });
            }
            res.status(200).json(subscription);
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

// Eliminar una suscripción por ID
exports.deleteSubscription = (req, res, next) => {
    const subscriptionId = req.params.id;

    PushSubscription.deleteOne({ _id: subscriptionId })
        .exec()
        .then(result => {
            res.status(200).json({
                _id: subscriptionId,
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.enviarNotificacion = (req, res, next) => {
    const { subscription } = req.body;

    const payload = {
        notification: {
            title: "😋🍰 Bienvenido a Austins Repostería",
            body: "Gracias por suscribirte. Descubre nuestras deliciosas creaciones.",
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            image: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [100, 50, 100],
            actions: [{
                action: "explore",
                title: "Ver nuestras especialidades",
                url: "https://austins.vercel.app"
            }]
        }
    };
    webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => {
            res.status(200).json({ message: 'Notificación de bienvenida enviada con éxito' });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};
