// Dialog
const {dialogflow} = require('actions-on-google');
const { BasicCard, Button, Image} = require('actions-on-google');

const app = dialogflow({debug: false});


const versionApp = require('./versionApp');
const jenkinsApp = require('./jenkinsApp');

app.intent('versionRequest',  versionApp.versionApp);

app.intent('app-deploy', jenkinsApp.deployRelease);
app.intent('app-compile', jenkinsApp.compileApp);
app.intent('app-release', jenkinsApp.releaseApp);



app.intent('make_name', (conv, {color, number}) => {
    conv.close(`Alright, your silly name is ${color} ${number}! ` +
        `I hope you like it. See you next time.`);
});


app.intent('which_language', (conv, {language } )=> {
    conv.ask("coucou");
    conv.ask("et une autres question ?");
});

module.exports = app;