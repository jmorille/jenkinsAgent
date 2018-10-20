const log = require('../logger');
const {SignIn} = require('actions-on-google');

module.exports = {

    'ask_for_sign_in': (conv) => {
        log.info("Ask for Sign In !!!!!!!!!!!!!!!!!!");
        conv.ask(new SignIn("Local Auth"));
        log.info("Ask for Sign In _____________________");
        return conv;
    },

    'ask_for_sign_in_confirmation': (conv, params, signin) => {
        log.info("ask_for_sign_in_confirmation !!!!!!!!!!!!!!!!", signin);
        if (signin.status !== 'OK') {
            return conv.ask("Vous devez vous identifiez avant d'utiliser l'application.");
        }
        // const access = conv.user.access.token;
        const payload = conv.user.profile.payload;
        conv.ask(`Bonjour, ${payload.name}. Que voulez vous faire maintenant?`);
        return conv;
    },

};