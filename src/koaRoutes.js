const Router = require('koa-router');
const packageInfo = require('../package.json');

const appVersions = require('./controllers/appVersions');

// config
const router = new Router();


// Info
router.get('/', (ctx, next) => {
    ctx.body = {
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description
    };
});
// Apis
const apiRouter = new Router({
    prefix: '/v1'
});
[appVersions].forEach(apiCtl=> {
    apiRouter.use(apiCtl.routes(), apiCtl.allowedMethods());
});


// register all routes
router.use(apiRouter.routes(), apiRouter.allowedMethods());

module.exports = router;