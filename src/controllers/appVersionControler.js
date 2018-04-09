const Router = require('koa-router');

const appVersion = require('../service/appVersionService');

const router = new Router({
    prefix: '/version'
});

router.get("/:app/:env", ctx => {
    const app = ctx.params.app;
    const envLabel = ctx.params.env;
    const env = conv[envLabel] || envLabel;
    return appVersion.getVersion(app, env).then(props => {
        ctx.body = {
            name: app,
            env: env,
            version: props["Version"]
        }

    });
});

const conv = {
    'Qualification': 'qualif',
    'Recette': 'rec',
    'Production': 'prod',
    'Developement': 'dev',
};

module.exports = router;