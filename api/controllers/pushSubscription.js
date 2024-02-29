const mongoose = require("mongoose");
const PushSubscription = require("../models/pushSubscription");
const webpush = require('web-push');

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

// Crear una nueva suscripción
exports.createSubscription = (req, res, next) => {
    const { endpoint, keys } = req.body;

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
};

function enviarNotificacionBienvenida(subscription) {

    const payload = {
        notification: {
            title: "😋🍰 Bienvenido a Austins Repostería-",
            body: " Descubre nuestras deliciosas creaciones.",
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [200, 50, 200],
            actions: [{
                action: "explore",
                title: "Ver nuestras especialidades"
            }]
        }
    };

    webpush.sendNotification(subscription, JSON.stringify(payload))
        .then(() => {
            console.log('Notificación de bienvenida enviada con éxito');
        })
        .catch(err => {
            console.error('Error al enviar notificación de bienvenida:', err);
        });
}

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
// Enviar notificación a una suscripción
// exports.enviarNotificacion = (req, res, next) => {
//     const { subscription, payload } = req.body;

//     webpush.sendNotification(subscription, JSON.stringify(payload))
//         .then(() => {
//             res.status(200).json({ message: 'Notificación enviada con éxito' });
//         })
//         .catch(err => {
//             res.status(500).json({ error: err.message });
//         });
// };
// Enviar notificación de bienvenida
exports.enviarNotificacion = (req, res, next) => {
    const { subscription } = req.body;

    // const payload = {
    //     notification: {
    //         title: "¡Bienvenido a nuestra aplicación!",
    //         body: "Gracias por unirte a nosotros. Esperamos que disfrutes de tu experiencia.",
    //         icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png"
    //     }
    // };
    const payload = {
        notification: {
            title: "😋🍰 Bienvenido a Austins Repostería",
            body: "Gracias por suscribirte. Descubre nuestras deliciosas creaciones.",
            icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            image: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
            vibrate: [100, 50, 100],
            actions: [{
                action: "explore",
                title: "Ver nuestras especialidades"
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
