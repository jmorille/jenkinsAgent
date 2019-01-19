const log = require('../logger');

const fetch = require('node-fetch');
const properties = require("properties");
const apps = require('../config/dory.json');



function getAppUrl(app, env) {
    let base;
    let dns;
    log.info("read env", env)
    log.info("read app", app)
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
    const env = Array.isArray(envLabel) ? envLabel[0] :envLabel;
    return envCodes[env] || envLabel;
}


function getAppUrlPromise(app, env) {
     return new Promise((resolve, reject) => {
         try {
             const envCode = getEnvCode(env);
             const url = getAppUrl(app, envCode);
             console.log("Request version url :",url);
             resolve(url);
         } catch (err) {
             reject(err);
         }
     })
}

function getVersion(app, env) {
    //log.info(`Get version of ${app} in ${env} =>`, typeof env), Array.isArray(env);
    //const envCode = getEnvCode(env);
    //const url = getAppUrl(app, envCode);
   return getAppUrlPromise(app, env).then(url => {
       return fetch(url)
           .then(res => {
               if (res.ok) {
                   return res.text()
               } else {
                   const httpError = new  Error(`HTTP Error ${res.status} : ${res.statusText}`);
                   httpError.status = res.status;
                   httpError.statusText = res.statusText;
                   throw  httpError;
               }

           })
           .then(parseVersionTxt)
           .then(data => {
               log.info(`Get version of ${app} in ${env} =>`, data);
               return {...data, url}
           })
   });

}

function parseVersionTxt(data) {
    const toParse = data.replace(': ','= ');
    return properties.parse(toParse);
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