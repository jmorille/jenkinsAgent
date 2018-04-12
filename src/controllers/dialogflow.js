const {deployRelease, compileApp, releaseApp} = require('../dialog/dialogJenkins');
const {requestVersion} = require('../dialog/dialogAppRequest');

exports.index = ctx => {
    ctx.body = {
        service: "Jenkins Agent"
    }
};


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

    const actionRes = handleAction(action, parameters, req).then(actionRes => {
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
    'versionRequest': requestVersion.bind(this),
    'authPerm': requestPerm.bind(this),
    'userInfo': userInfo.bind(this)
}


function handleAction(action, parameters, req) {
    const fn = actions[action];
    if (!fn) return new Promise(function (resolve, reject) {
        const noActionMsg = {"fulfillmentText": "Action non trouvé"};
        resolve(noActionMsg);
    });
    return fn(action, parameters, req);
}


function requestPerm() {
    return new Promise(function (resolve, reject) {
        const text = "Je souhaite te connaitre";
        // "fulfillmentText": text,
        // "https://wwww.googleapis.com/auth/userinfo.email"
        const dialog = {
            "payload": {
                "google": {
                    "conversationToken": "{'state':null,'data':{}}",
                    "expectUserResponse": true,
                    "systemIntent": {
                        "intent": "actions.intent.PERMISSION",
                        "inputValueData": {
                            "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
                            "optContext": "Pour accéder à Jenkins",
                            "permissions": [
                                "NAME",
                                "DEVICE_PRECISE_LOCATION",
                                "email"
                            ]
                        }
                    }

                }
            }
        }
        resolve(dialog);
    });
}


function userInfo(action, parameters, req) {
    const googleInfo = req.originalDetectIntentRequest.payload;
    require('fs').writeFile("user-info.json", JSON.stringify(googleInfo,undefined,2),err=>{
        console.log("File saved");
    })
    const profile = googleInfo.user.profile;

    console.log(googleInfo.user);
    console.log(googleInfo.device);
    return new Promise(function (resolve, reject) {
       const msg =  {
           "fulfillmentText": `Bonjour ${profile.displayName}, votre email est ${profile.email}`
       };
       resolve(msg);
    });
}