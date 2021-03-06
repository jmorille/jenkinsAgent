const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true,
            prettyPrint: true
        }),
        new (winston.transports.File)({ filename: 'logs/jenkinAgent.log' })
    ]
});

module.exports = logger;