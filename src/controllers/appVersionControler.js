const Router = require('koa-router');
const fetch = require('node-fetch');
const properties = require("properties");

const router = new Router({
    prefix: '/version'
});

router.get('/:app', ctx => {
    const app = ctx.params.app;
    return getVersion(app).then(props => {
        ctx.body = {
            name: "version",
            app: props
        }

    });
});

const apps = {
    HDF: "https://www.groupagrica.com"
};

function getAppUrl(app) {
    let base =  apps[app];
    return `${base}/version.txt`
}


function getVersion(app) {
    const url = getAppUrl(app);
    return fetch(url).then(res => res.text()).then(data => {
        console.log(data);
        let props = properties.parse(data);
        console.log(props);
        return props;
    });
}


module.exports = router;