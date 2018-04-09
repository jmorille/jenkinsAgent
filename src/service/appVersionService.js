const fetch = require('node-fetch');
const properties = require("properties");
const CSON = require('cson');
const apps = require('../config/dory.json');



function getAppUrl(app, env) {
    let dns = apps[app][env]["url"];
    console.log("Found ", dns.dmz[0], env);
    let base;
    if(dns.dmz.length != 0) {
        base = dns.dmz[0];
    } else {
        base = dns.lan[0];
    }
    // let base = dns[env] ? dns[env] : env + '-' + dns.prod;

    if(base[base.length - 1] === '/')
        return `${base}version.txt`;
    return `${base}/version.txt`
}


function getVersion(app, env) {
    const url = getAppUrl(app, env);
    console.log(url);
    return fetch(url)
        .then(res => res.text())
        //.then(data => CSON.parse(data));
        .then(data => {
            return data.replace(': ','= ');
        })
        .then(data => properties.parse(data));
}


module.exports.getVersion = getVersion;