const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({}, jenkinsConfig));



function deployRelease(req, parameters) {
    let appName = parameters.app;
    let appCode = `${appName}`.toLocaleUpperCase();
    let name = `deploy-${appCode}-pipeline`;
    return callJenkinsJob(name, parameters).then(res => {
        console.log('Jenkins Job : ', name, " ==> ", res);
        return res;
    });
}

function compileApp(req, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;
    return callJenkinsJob(name, parameters).then(res => {
        console.log('Jenkins Job : ', name, " ==> ", res);
        return res;
    });
}

function releaseApp(req, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;
    return callJenkinsJob(name, parameters).then(res => {
        console.log('Jenkins Job : ', name, " ==> ", res);
        return res;
    });
}

module.exports.deployRelease = deployRelease;
module.exports.compileApp = compileApp;
module.exports.releaseApp = releaseApp;



function callJenkinsJob(name, params) {
    //const parameters = { "nexusVersion": "2.0.0.RELEASE" };
    const version = "2.0.0.RELEASE";
    const deployTo = getParamEnv(params);
    const parameters = {deployTo, version};
    // TODO Add Paramters to jenkins query
    return jenkins.job.exists(name)
        .then(exists => {
            return checkPromiseJobExist(exists, name)
        })
        .then(exists => {
            return jenkins.job.build({name, parameters})
        })
        .then(queueItemNumber => {
            console.log("queueItemNumber : ", queueItemNumber, " for Jenkins job : ", name);
            return {
                "fulfillmentText": 'Mise en queue numéro ' + queueItemNumber
            };
        }).catch(err => { return formatJenkinsErrorPromise(err, name, params)} );
}



/** ******************************** **/
/** ******* Value Converters ******* **/
/** ******************************** **/

const dialogFlowEnvs = {
    'production': 'Production',
    'recette': 'Recette',
    'qualification': 'Qualification'

};

function getParamEnv(params) {
    const env = params.env;
    return dialogFlowEnvs[env] || env;

}

/** ******************************** **/
/** ******* Check Job Exists ******* **/
/** ******************************** **/

function checkPromiseJobExist(exists, name) {
    if (!exists) {
        throw generateErrorNotJenkinsJob({name});
    }
    return exists;
}

function generateErrorNotJenkinsJob({name}) {
    const dialogErrMsg = {
        "fulfillmentText": `Désolé, le Job Jenkins ${name} n'existe pas`
    }
    const err = new Error(`No Jenkins Job : ${name}`);
    err.statusCode = 404;
    err.dialogRes = dialogErrMsg;
    return err;
};

/** ******************************** **/
/** ******* Error Management ******* **/
/** ******************************** **/


function formatJenkinsErrorPromise(err, name , params) {
    try {

        let errResBody = err.res ? err.res.body : undefined;
        let dialogMsg = `Erreur Jenkins sur l'appel du Job ${name}`;
        if (err.statusCode) {
            dialogMsg += ` avec le code http ${err.statusCode}`
        }
        const dialogRes = {
            "fulfillmentText": dialogMsg
        };
        err.dialogRes = dialogRes;
        // Parse Stacktrace
        const stacktrace = parseJenkinsErrorPage(errResBody);
        if (stacktrace) {
            console.error(stacktrace);
            const basicCard = {
                "basicCard": {
                    "title": `Erreur ${err.statusCode}`,
                    "subtitle": `Stacktrace de ${name}`,
                    "formattedText": `${stacktrace}`
                }
            };
            const payload = {
                "google": {
                    "expectUserResponse": true,
                    "richResponse": {
                        "items": [
                            {
                                "simpleResponse": {
                                    "textToSpeech": dialogMsg,
                                    "displayText": dialogMsg
                                }
                            },
                            basicCard
                        ]
                    }
                }
            }
            dialogRes.payload = payload;
        }
        throw err;
    } catch (errMangaError) {
        console.error("Error during catch the original Error", errMangaError);
        throw err;
    }
}

/** ******************************** **/
/** ******* Other            ******* **/
/** ******************************** **/

