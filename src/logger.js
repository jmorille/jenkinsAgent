const winston = require('winston');

const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            colorize: true
        }),
        new (winston.transports.File)({ filename: 'jenkinAgent.log' })
    ]
});

module.exports = logger;