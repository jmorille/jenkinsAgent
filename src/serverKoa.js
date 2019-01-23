const Koa = require('koa');
const router = require('./koaRoutes');
const bodyParser = require('koa-bodyparser');
const compress = require('koa-compress');
const cors = require('@koa/cors');

/**
 * Koa Server.
 */
const app = module.exports = new Koa();

// config
app.use(bodyParser());
app.use(compress());
app.use(cors({
    origin:'*'
}));

// look ma, error propagation!
app.use((ctx, next) => {
    return next().catch((err) => {
        ctx.status = err.status || 500;
        ctx.body = {message: err.message, status: ctx.status, errors: err.errors};
        // since we handled this manually we'll want to delegate to the regular app
        // level error handling as well so that centralized still functions correctly.
        ctx.app.emit('error', err, ctx);
        // logger.error(err);
    });
});


// response
app
    .use(router.routes())
    .use(router.allowedMethods());