const log = require('./logger');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

// server http
const server = module.exports = express();

// Confif Middleware
server.use(bodyParser.json());
server.use(compression());


// express-winston logger makes sense BEFORE the router
const winston = require('winston');
const expressWinston = require('express-winston');

server.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true,
            humanReadableUnhandledException: true,
            prettyPrint: true
        }),
        new (winston.transports.File)({
            filename: 'logs/jenkinAgent-http.log'
        })
    ]
}));

// Add routes
const router = require('./routes');
server.use(router);


