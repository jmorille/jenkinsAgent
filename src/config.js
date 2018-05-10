const jenkinsConfig = require("../config/jenkins.json");
import readEnv from 'read-env';

const options = readEnv('JAGENT');

const config = Object.assign({}, jenkinsConfig, options)


module.export = config;
