const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({},jenkinsConfig));


exports.index = ctx =>{
  ctx.body = {
      service: "Jenkins Agent"
  }
};
// https://dialogflow.com/docs/reference/api-v2/rest/v2beta1/WebhookRequest

exports.intent = ctx => {
    console.log('----------', JSON.parse(JSON.stringify( ctx.request.body)));
    const req = ctx.request.body;

    let response ;
    if (req.result) {
        response =processV1Request(req);
    } else if (req.queryResult) {
        response = processV2Request(req);
    } else {
        console.log('Invalid Request', req);
        return ctx.throw(400, 'Invalid Webhook Request (expecting v1 or v2 webhook request)', req);
    }
    // Premare response
    let res =  Object.assign({}, req, response);
    res.fulfillmentText= "Hipica jep pauvre con";
    console.log('My response : ', JSON.stringify(res, undefined, 2) );
    ctx.body = res;
    //require('fs').writeFile('dialogv2.json', JSON.stringify( req), 'utf8');

    //"speech" is the spoken version of the response, "displayText" is the visual version
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
    return handleAction(action, parameters);
}

const ations = {
    'deploy': deployRelease.bind(this),
    'compile': compileApp.bind(this),
    'release': releaseApp.bind(this),
    'versionRequest': requestVersion.bind(this)
}


async function handleAction(action, parameters) {
    const fn = ations[action];
    console.log(`Action ${action} fn`, fn);
    console.log("action fn", fn);
    return fn.call(this, action, parameters);
}


async function deployRelease(action, parameters) {
    let appName = parameters.app;
    let name = `${action}-${appName}-release`;
    jenkins.job.build({name}).then(res => {
        console.log('Jenkins Job : ', name, " ==> ",res);
        return res;
    });
}

async function compileApp(action, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;

}

async function releaseApp(action, parameters) {
    let appName = parameters.app;
    let name = `ci-${appName}-branch-dev`;
}

async function requestVersion(action, parameters) {
    console.log('')
    return {
        fulfillmentText: "Hipica jep pauvre con"
    }
}