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


function getVersion(app, env) {
    const url = getAppUrl(app, env);
    console.log("Request version url :",url);
    return fetch(url)
        .then(res => res.text())
        .then(data => {
            return data.replace(': ','= ');
        })
        .then(data => properties.parse(data))
}


module.exports.getVersion = getVersion;