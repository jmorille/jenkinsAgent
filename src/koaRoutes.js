const Router = require('koa-router');
const packageInfo = require('../package.json');

const api = require('./controllers/index');

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


router.use(api.routes(), api.allowedMethods());



module.exports = router;