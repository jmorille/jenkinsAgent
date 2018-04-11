//const uuidv4 = require('uuid/v4');
const htmlparser = require('htmlparser2');


const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({}, jenkinsConfig));

const appVersion = require('../service/appVersionService');


exports.index = ctx => {
    ctx.body = {
        service: "Jenkins Agent"
    }
};

const envCodes = {
    'production': 'prod',
    'recette': 'rec',
    'qualification': 'qa'

};

function getEnvCode(envLabel) {
    return envCodes[envLabel] || envLabel;
}

// https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest

exports.intent = ctx => {
    // console.log('Request ----------', JSON.parse(JSON.stringify( ctx.request.body)));
    const req = ctx.request.body;

    let response;
    if (req.result) {
        response = processV1Request(req);
    } else if (req.queryResult) {
        response = processV2Request(req);
    } else {
        console.log('Invalid Request', req);
        return ctx.throw(400, 'Invalid Webhook Request (expecting v1 or v2 webhook request)', req);
    }
    // Prepare response
    return response.then(body => {
        //console.error('My response : ', JSON.stringify(body, undefined, 2));
        ctx.body = body;
    }).catch(err => {
        // Print Error message
        console.error(err.statusCode, err.message);
        // Manage Dialog response
        if (err.dialogRes) {
            ctx.body = err.dialogRes;
        } else {
            ctx.body = {
                "fulfillmentText": "C'est embarassant, il y a une petite erreur technique"
            }
        }

    })
};

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


function processV1Request(req) {
    console.log('-----> processV1 Request');
    let action = req.result.action; // https://dialogflow.com/docs/actions-and-parameters
    let parameters = req.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
    let inputContexts = req.result.contexts; // https://dialogflow.com/docs/contexts
    let requestSource = (req.originalRequest) ? req.originalRequest.source : undefined;
    console.log("session id : ", req.sessionId);
    console.log("user : ", req.originalRequest.data.user);
    console.log("action : ", action, " ---> parameters : ", parameters);
    return handleAction(action, parameters);
}

function processV2Request(req) {
    console.log('-----> processV2 Request');
    // An action is a string used to identify what needs to be done in fulfillment
    let action = (req.queryResult.action) ? req.queryResult.action : 'default';
    // Action incomplete

    // Parameters are any entities that Dialogflow has extracted from the request.
    let parameters = req.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
    // Contexts are objects used to track and store conversation state
    let inputContexts = req.queryResult.contexts; // https://dialogflow.com/docs/contexts
    // Get the request source (Google Assistant, Slack, API, etc)
    let requestSource = (req.originalDetectIntentRequest) ? req.originalDetectIntentRequest.source : undefined;
    // Get the session ID to differentiate calls from different users
    let session = (req.session) ? req.session : undefined;
    console.log("session id : ", session);
    console.log("action : ", action, " ---> parameters : ", parameters);
    // response

    const actionRes = handleAction(action, parameters).then(actionRes => {
        console.log("Action response", JSON.stringify(actionRes));
        const res = {
            "outputContexts": req.queryResult.outputContexts
        };
        return Object.assign({}, res, actionRes);
    });
    return actionRes;
}

const actions = {
    'deploy': deployRelease.bind(this),
    'compile': compileApp.bind(this),
    'release': releaseApp.bind(this),
    'versionRequest': requestVersion.bind(this)
}


function handleAction(action, parameters) {
    const fn = actions[action];
    return fn(action, parameters);
}


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

const dialogFlowEnvs = {
    'production': 'Production',
    'recette': 'Recette',
    'qualification': 'Qualification'

};

function getParamEnv(params) {
    const env = params.env;
    return dialogFlowEnvs[env] || env;

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

function checkPromiseJobExist(exists, name) {
    if (!exists) {
        throw generateErrorNotJenkinsJob({name});
    }
    return exists;
}

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


function requestVersion(req, parameters) {
    const app = parameters.app;
    const envLabel = parameters.env;
    return appVersion.getVersion(app, getEnvCode(envLabel))
        .then(data => {
            const version = data.Version;
            const date = data.Date;
            let text;
            console.log("data : ", data);
            console.log("version : ", version);
            if (!version) {
                text = `La version de cette application n'a pas été trouvée `;
            } else {
                text = `La ${envLabel} de ${app} en est en version ${version} `;
            }

            // console.log("app version", data);
            const basicCard = {
                "basicCard": {
                    "title": `Application ${app}`,
                    "subtitle": `Environnement de ${envLabel}`,
                    "formattedText": ` 
                                         **Buildée le** ${date}  
                                         **Commit** ${data.Commit}`

                }
            };
            return {
                "fulfillmentText": text,
                "payload": {
                    "google": {
                        "expectUserResponse": true,
                        "richResponse": {
                            "items": [
                                {
                                    "simpleResponse": {
                                        "textToSpeech": text,
                                        "displayText": text
                                    }
                                },
                                basicCard
                            ]
                        }
                    }
                }
            }
        });
}