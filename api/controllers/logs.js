const Log = require('../models/logs'); // Importa el modelo Logger


exports.saveRequestLogs = async (req, res, next) => {
    try {
        // Crea un nuevo registro de log
        const log = new Logger({
            date: new Date(), // Fecha y hora actual
            description: `Request to ${req.method} ${req.originalUrl} from ${req.ip}`, // Descripción de la solicitud
        });

        // Guarda el registro en la base de datos
        await log.save();
        
        // Llama a la siguiente función de middleware en la cadena
        next();
    } catch (error) {
        // Maneja cualquier error que ocurra al guardar el registro
        console.error('Error al guardar el registro de solicitud:', error);
        // Continúa con el siguiente middleware (si lo hay) pero indica que ha ocurrido un error
        next(error);
    }
};