const appVersion = require('../service/appVersionService');

const envCodes = {
    'production': 'prod',
    'recette': 'rec',
    'qualification': 'qa'

};

function getEnvCode(envLabel) {
    return envCodes[envLabel] || envLabel;
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


module.exports.requestVersion = requestVersion;