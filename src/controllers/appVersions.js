// express
//const express = require('express');
//const router = module.exports = new express.Router();

// Koa
const Router = require('koa-router');
const router = new Router({
    prefix: '/version'
});

// log
const log = require('../logger');
// service
const appDAO = require('../dao/appDAO');
const versionDAO = require('../dao/versionAppDAO');


router.get('/', (ctx, next) => {
     return getAllAppVersions()
         .then(appVersions => {
             ctx.body = appVersions;
         });
});

// router.get('/v1/app/versions', (req, res) => {
//     getAllAppVersions()
//         .then(appVersions => res.json(appVersions));
// });


function getAllAppVersions(req) {
    return appDAO.getApps().then(apps => {
        const promises = apps.map(item => {
            return getAppVersions(item, item.name)
        });
        return Promise.all(promises);
    });
}

function getAppVersions(app, name) {
    const envRegex = /(qa|rec|prod)([0-0]?)/;
    // Request All Version
    const envsPromise = Object.entries(app)
        .filter(item => {
            return item[0].match(envRegex)
        })
        .sort(envComparator)
        .map(item => {
            return versionDAO.getVersion(name, item[0])
                .then(ver => {
                    return {[[item[0]]]: ver}
                })
                .catch(err => {
                    return {[[item[0]]]: {error: err.message}}
                });
        });
    // Construct version result
    return Promise.all(envsPromise).then(appVersions => {
            const versions = appVersions.reduce((acc, ver) => {
                return {...acc, ...ver};
            }, {});
            return {name, versions}
        }
    );
}


function computeEnvWeigth(env) {
    const envPattern = /([a-z]+)([0-9])?/
    const match = envPattern.exec(env);
    let group = 0;
    if (match) {
        switch (match[1]) {
            case "dev":
                group += 100;
                break;
            case "qa":
                group += 200;
                break;
            case "rec":
                group += 300;
                break;
            case "prod":
                group += 500;
                break;
        }
        if (match[2]) {
            group += match[2];
        }
    }
    return group;
}

function envComparator(a, b) {
    const aW = computeEnvWeigth(a);
    const bW = computeEnvWeigth(b);
    if (aW > bW) {
        return 1;
    } else if (aW < bW) {
        return -1;
    } else {
        return 0;
    }
}


module.exports = router;