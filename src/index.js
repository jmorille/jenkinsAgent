#!/usr/bin/env node

const Koa = require('koa');
const app = new Koa();

const logger = require('koa-logger');
const errorJson = require('koa-json-error');
const compress = require('koa-compress');
const favicon = require('koa-favicon');

const bodyParser = require('koa-bodyparser');


const router = require('./routes');


// Trust proxy
app.proxy = true;

// Set middlewares

app.use(logger());
app.use(compress({
    threshold: 12
}));

app.use(errorJson());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(
    bodyParser({
        enableTypes: ['json'],
        jsonLimit: '10mb'
    })
);

// Bootstrap application router
app.use(router.routes());
app.use(router.allowedMethods());




app.listen(3000, () => {
    console.log("Server listening http://localhost:3000");
});