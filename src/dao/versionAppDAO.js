const fetch = require('node-fetch');
const properties = require("properties");
const apps = require('../config/dory.json');



function getAppUrl(app, env) {

    let base;
    let dns;
    if(!(dns = apps[app][env]["url"])) {
        throw new Error('Aucune URL trouvée pour cette application sur l\'environnement renseigné');
    } else {

        if (dns.dmz) {
            base = dns.dmz[0];
        } else if (dns.lan) {
            base = dns.lan[0];
        } else {
            throw new Error('Aucune adresse trouvée');
        }
        // let base = dns[env] ? dns[env] : env + '-' + dns.prod;

        return (base[base.length - 1] === '/') ? `${base}version.txt` : `${base}/version.txt`;
    }
}
const envCodes = {
    'production': 'prod',
    'recette': 'rec',
    'qualification': 'qa'

};

function getEnvCode(envLabel) {
    return envCodes[envLabel] || envLabel;
}


function getVersion(app, env) {
    const envCode = getEnvCode(env);
    const url = getAppUrl(app, envCode);
    console.log("Request version url :",url);
    return fetch(url)
        .then(res => res.text())
        .then(data => {
            return data.replace(': ','= ');
        })
        .then(data => properties.parse(data))
}

function fetchWrapper(url, options, timeout) {
    return new Promise((resolve, reject) => {
        fetch(url, options).then(resolve).catch(reject);

        if (timeout) {
            const e = new Error("Connection timed out");
            setTimeout(reject, timeout, e);
        }
    });
}


module.exports = {
    getVersion
};