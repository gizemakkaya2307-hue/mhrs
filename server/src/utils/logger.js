const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        (info) => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    )
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../server_err.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(__dirname, '../../server.log')
        }),
    ],
});

module.exports = logger;
