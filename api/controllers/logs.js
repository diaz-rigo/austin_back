const Log = require('../models/logs');
const useragent = require('express-useragent');
exports.saveRequestLogs = async (req, res, next) => {
    try {
        const userAgent = useragent.parse(req.headers['user-agent']);
        const log = new Log({
            date: new Date(),
            message: `Request to ${req.method} ${req.originalUrl} from ${req.ip}`,
            level: 'INFO',
            userAgent: {
                browser: userAgent.browser,
                version: userAgent.version,
                os: userAgent.os,
                platform: userAgent.platform,
                source: req.headers['user-agent']
            }
        });
        await log.save();
        next();
    } catch (error) {
        console.error('Error al guardar el registro de solicitud:', error);
        next(error);
    }
};
