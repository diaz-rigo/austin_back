const Log = require('../models/logs');
const useragent = require('express-useragent');

exports.saveRequestLogs = async (req, res, next) => {
    try {
        // Obtener el User-Agent de la solicitud
        const userAgent = useragent.parse(req.headers['user-agent']);

        // Crear un nuevo registro de log
        const log = new Log({
            date: new Date(),
            message: `Request to ${req.method} ${req.originalUrl} from ${req.ip}`,
            level: 'INFO',
            // Agregar detalles del navegador al mensaje del log
            userAgent: {
                browser: userAgent.browser,
                version: userAgent.version,
                os: userAgent.os,
                platform: userAgent.platform,
                source: req.headers['user-agent']
            }
        });

        // Guardar el registro en la base de datos
        await log.save();
        
        // Continuar con el siguiente middleware en la cadena
        next();
    } catch (error) {
        // Manejar cualquier error que ocurra al guardar el registro
        console.error('Error al guardar el registro de solicitud:', error);
        // Continuar con el siguiente middleware, indicando que ocurrió un error
        next(error);
    }
};
