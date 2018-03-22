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
    "PAI" : {
        dns: "www.groupagrica.com"
    },
    "HDF": {
        dns: "hdf.agrica.loc"
    }
};

function getAppUrl(app) {
    let base =  apps[app].dns;
    return `https://${base}/version.txt`
}


function getVersion(app) {
    const url = getAppUrl(app);
    console.log(url);
    return fetch(url)
        .then(res => res.text())
        .then(data => properties.parse(data));
}


module.exports = router;