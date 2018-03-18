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
    ctx.body = response;
    //require('fs').writeFile('dialogv2.json', JSON.stringify( req), 'utf8');

    //"speech" is the spoken version of the response, "displayText" is the visual version
};

function processV1Request(req) {
    console.log('-----> processV1Request');
    let action = req.result.action; // https://dialogflow.com/docs/actions-and-parameters
    let parameters = req.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
    let inputContexts = req.result.contexts; // https://dialogflow.com/docs/contexts
    let requestSource = (req.originalRequest) ? req.originalRequest.source : undefined;
    console.log("action : ", action, " ---> parameters : ", parameters);
    handleAction(action, parameters);
}

function processV2Request(req) {
    console.log('-----> processV2Request');
// An action is a string used to identify what needs to be done in fulfillment
    let action = (req.queryResult.action) ? req.queryResult.action : 'default';
    // Parameters are any entities that Dialogflow has extracted from the request.
    let parameters = req.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
    // Contexts are objects used to track and store conversation state
    let inputContexts = req.queryResult.contexts; // https://dialogflow.com/docs/contexts
    // Get the request source (Google Assistant, Slack, API, etc)
    let requestSource = (req.originalDetectIntentRequest) ? req.originalDetectIntentRequest.source : undefined;
    // Get the session ID to differentiate calls from different users
    let session = (req.session) ? req.session : undefined;
    console.log("action : ", action, " ---> parameters : ", parameters);
    handleAction(action, parameters);
}

async function handleAction(action, parameters) {
    let name = '';
    let appName = parameters.app;
    switch (action) {
        case 'deploy':
            name = `${action}-${appName}-release`;
            break;
        case 'compile':
            name = `ci-${appName}-branch-dev`;
            break;
        case 'release':
            name = `ci-${appName}-release`;
            break;
    }
    await jenkins.job.build({name}).then(res => {
        console.log('Jenkins Job : ', name, " ==> ",res);
    });

}