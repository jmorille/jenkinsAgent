const log = require('../logger');

const jenkins = require('../dao/jenkinsDAO');

const { BasicCard } = require('actions-on-google');


// Jenkins error display
// *************************
function displayJenkinsError(conv, err, {app}) {
    const {jenkinsJob, stacktrace} = err.detail;
    conv.ask(`Erreur Jenkins sur l'appel du Job ${jenkinsJob}`);
    if (stacktrace) {
        conv.ask(new BasicCard({
            "title": `Erreur du Job ${jenkinsJob}`,
            "subtitle": `Erreur ${err.statusCode}`,
            "text": `${stacktrace}`
        }));
    }
    return err;
}


// Dialogflow Intents Apis
// *************************
function deployRelease(conv, {app, env, version} ) {
    return jenkins.deployRelease(app, version, env).then(res => {
        log.info(`Deploy ${app} in ${env} (${res.queueItemNumber})`);
        conv.ask(`Je lance le job jenkins déploiement en ${env} pour l'application ${app}`);
        return conv;
    }).catch(err => {
        return displayJenkinsError(conv, err, {app, env, version});
    });
}

function compileApp(conv, {app, env, version} ) {
    return jenkins.compileApp(app).then(res => {
        log.info(`Compile ${app} (${res.queueItemNumber})`);
        conv.ask(`Je lance le job de copilation de l'application ${app}`);
        return conv;
    }).catch(err => {
        return displayJenkinsError(conv, err, {app, env, version});
    });
}

function releaseApp(conv, {app, version} ) {
    return jenkins.releaseApp(app, version).then(res => {
        log.info(`Release ${version} for {app} (${res.queueItemNumber})`);
        conv.ask(`Je lance la release ${version} de l'application ${app}`);
        return conv;
    }).catch(err => {
        return displayJenkinsError(conv, err, {app, env, version});
    });
}
module.exports= { deployRelease,compileApp, releaseApp };