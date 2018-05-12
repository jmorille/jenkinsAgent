const log = require('../logger');

const { BasicCard } = require('actions-on-google');

const versionDAO = require('../dao/versionAppDAO');

function versionApp(conv, {app, env} ) {
    return versionDAO.getVersion(app, env).then(data => {
        const version = data.Version;
        const date = data.Date;
        let text;
        if (!version) {
            text = `La version de cette application n'a pas été trouvée `;
        } else {
            text = `La ${env} de ${app} en est en version ${version} `;
        }
        conv.ask(new BasicCard({
            "title": `Application ${app}`,
            "subtitle": `Environnement de ${envLabel}`,
            "text": `**Buildée le** ${date}  
**Commit** ${data.Commit}`
        }));
        return conv.ask(text);
    });
}

module.exports.versionApp = versionApp;