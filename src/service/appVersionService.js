const fetch = require('node-fetch');
const properties = require("properties");
const CSON = require('cson');

const apps = {
    "PAI": {
        dns: {
            prod: "www.groupagrica.com"
        }
    },
    "HDF": {
        dns: {
            prod: "hdf"
        }
    }
};


function getAppUrl(app, env) {
    let dns = apps[app].dns;
    console.log("Found ", dns, env);
    let base = dns[env] ? dns[env] : env + '-' + dns.prod;
    return `https://${base}/version.txt`
}


function getVersion(app, env) {
    const url = getAppUrl(app, env);
    console.log(url);
    return fetch(url)
        .then(res => res.text())
        //.then(data => CSON.parse(data));
        .then(data => {
            return data.replace(': ');
        })
        .then(data => properties.parse(data));
}


module.exports.getVersion = getVersion;