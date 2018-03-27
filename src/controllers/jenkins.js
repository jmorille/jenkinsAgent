const Router = require('koa-router');

const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({},jenkinsConfig));

const router = new Router({
    prefix: '/jenkins'
});

router.get('/', ctx => {
    ctx.body = {
        name: "jenkins"
    }
});

router.get('/info', async ctx => {
    await jenkins.info().then(res => {
        ctx.body = res
    });
});


router.get('/jobs', async ctx => {
    await jenkins.job.list().then(res => {
        ctx.body = res
    });
});

router.get('/job/build/:app', async ctx => {
    const app = ctx.params.app;
    const name = deployJobName(app);
    await jenkins.job.build({name}).then(res => {
        ctx.body = res

    });
});



router.get('/job/copy/:src/:dest', async ctx => {
    const from = deployJobName(ctx.params.src);  ;//deployJobName('HDF');
    const to = deployJobName(ctx.params.src);
    await jenkins.job.copy(from, to).then(res => {
        ctx.body = {
            from, to
        }
    });
});




function deployJobName(app) {
    return `deploy-${app}-release`;
}


exports.router = router;