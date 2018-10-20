// Dialog
const {dialogflow} = require('actions-on-google');
const { BasicCard, Button, Image} = require('actions-on-google');

const versionApp = require('./versionApp');
const jenkinsApp = require('./jenkinsApp');
const signIn = require('./signIn');


const app = dialogflow({
    debug: true,
    clientId: "789987504517-i8tdg4f3aeebinqm5scdd6bgqj0o6alk.apps.googleusercontent.com",
});



app.intent('app-version',  versionApp.versionApp);

app.intent('app-deploy', jenkinsApp.deployRelease);
app.intent('app-compile', jenkinsApp.compileApp);
app.intent('app-release', jenkinsApp.releaseApp);

app.intent('ask_for_sign_in', signIn.ask_for_sign_in);
app.intent('ask_for_sign_in_confirmation', signIn.ask_for_sign_in_confirmation);



app.intent('make_name', (conv, {color, number}) => {
    conv.close(`Alright, your silly name is ${color} ${number}! ` +
        `I hope you like it. See you next time.`);
});




module.exports = app;