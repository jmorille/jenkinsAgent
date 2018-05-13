const log = require('./logger');

const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');

// server http
const app = module.exports = express();

// Confif Middleware
app.use(bodyParser.json());
app.use(compression());


// express-winston logger makes sense BEFORE the router
const winston = require('winston');
const expressWinston = require('express-winston');

app.use(expressWinston.logger({
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

// Security
// const Keycloak = require('keycloak-connect');
// const session = require('express-session');
// app.use(express.session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }));
// const memoryStore = new session.MemoryStore();
//
// const keycloak = new Keycloak({ store: memoryStore });
// app.use( keycloak.middleware() );

// Add routes

const router = require('./routes');
app.use( router );



