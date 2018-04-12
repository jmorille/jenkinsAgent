const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({}, jenkinsConfig));

const htmlparser = require('htmlparser2');

// Entities
// *************************
const {getParamEnv} = require('./dialogEntity');

// Jenkins Functions
// *************************
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


// Jenkins Call jobs
// *************************
function callJenkinsJob(name, params) {
    //const parameters = { "nexusVersion": "2.0.0.RELEASE" };
    const version = "2.0.0.RELEASE";
    const deployTo = getParamEnv(params);
    const parameters = {deployTo, version};
    // check and call Jobs
    return jenkins.job.exists(name)
        .then(exists => {
            return checkPromiseJobExist(exists, name);
        })
        .then(exists => {
            return jenkins.job.build({name, parameters});
        })
        .then(queueItemNumber => {
            console.log("queueItemNumber : ", queueItemNumber, " for Jenkins job : ", name);
            return {
                "fulfillmentText": 'Mise en queue numéro ' + queueItemNumber
            };
        }).catch(err => {
            return formatJenkinsErrorPromise(err, name, params)
        });
}


// Check Job Exists
// *************************
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

// Error Management
// *************************
function formatJenkinsErrorPromise(err, name, params) {
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


function parseJenkinsErrorPage(html) {
    if (!html) return '';
    // Prepare Iteration
    let isBody = false;
    let isStacktrace = false;
    let divCount = 0;
    let stacktrace = "";
    const parser = new htmlparser.Parser({
        onopentag: function (name, attributes) {
            if (isBody) {
                if (name === "div") {
                    divCount += 1;
                    console.log('--- divCount OPEN = ', divCount);
                } else if (name === 'pre') {
                    isStacktrace = true;
                }
            } else if (name === "div" && 'error-description' === attributes.id) {
                isBody = true;
            }
        },
        ontext: function (text) {
            if (isStacktrace) {
                stacktrace += text;
                stacktrace += "/n";
            }
        },
        onclosetag: function (name) {
            if (name === "body") {
                isBody = false;
            }
            if (isBody) {
                if (name === 'div') {
                    divCount += -1;
                    console.log('--- divCount CLOSE = ', divCount);

                    if (divCount <= 0) {
                        isBody = false;
                    }
                } else if (name === 'pre') {
                    isStacktrace = false;
                }

            }
        }
    }, {decodeEntities: true});
    parser.write(html);
    parser.end();
    return stacktrace;
}

/** ******************************** **/
/** ******* Other            ******* **/
/** ******************************** **/

