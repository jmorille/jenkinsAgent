const Router = require('koa-router');
const appVersions = require('./appVersions');

const router = new Router({
    prefix: '/v1'
});

router.use(appVersions.routes(), appVersions.allowedMethods());



module.exports = router;