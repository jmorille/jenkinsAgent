const uuidv4 = require('uuid/v4');


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
        console.error('My response : ', JSON.stringify(body, undefined, 2));
        ctx.body = body;
    }).catch(err => {
        ctx.body = {
            "fulfillmentText": "C'est embarassant, il y a une petite erreur technique"
        }
    })
};

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
    // const res =  {
    //     "fulfillmentMessages": [
    //         {
    //             "card": {
    //                 "title": "card title",
    //                 "subtitle": "card text",
    //                 "imageUri": "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
    //                 "buttons": [
    //                     {
    //                         "text": "button text",
    //                         "postback": "https://assistant.google.com/"
    //                     }
    //                 ]
    //             }
    //         }
    //     ]
    //
    // };

    // const res2 = Object.assign({}, req);
    // res2.queryResult.fulfillmentText = "Oh la la";
    // res2.queryResult.fulfillmentMessages= [
    //     {
    //         "text": {
    //             "text": [
    //                 "Oh la la"
    //             ]
    //         }
    //     }
    // ]
    // return res2;
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
    let name = `deploy-${appName}-release`;
    return jenkins.job.build({name}).then(res => {
        console.log('Jenkins Job : ', name, " ==> ", res);
        return res;
    });
}

function compileApp(req, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;

}

function releaseApp(req, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;
}

function requestVersion(req, parameters) {
    const app = parameters.app;
    const envLabel = parameters.env;
    return appVersion.getVersion(app, getEnvCode(envLabel))
        .then(data => {
            const version = data.Version;
            return {
                "fulfillmentText": `La ${envLabel} de ${app} en est en version ${version}`
            }
        });
}