const log = require('../logger');

const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')({...jenkinsConfig});

const htmlparser = require('htmlparser2');



// Jenkins Menu Params
// *************************
const dialogFlowJenkinsEnvMapping = {
    'production': 'Production',
    'recette': 'Recette',
    'qualification': 'Qualification'

};

function getMenuEnvLabel(env) {
    return dialogFlowJenkinsEnvMapping[env] || env;
}


// Jenkins Call jobs
// *************************
function callJenkinsJob(name, params) {
    // check and call Jobs
    return jenkins.job.exists(name)
        .then(assertJenkinsJobExist(name))
        .then(exists => {
            //log.debug('---------------------------- ', {name,  parameters: params});
            return jenkins.job.build({name,  parameters: params})
        })
        .then(queueItemNumber => {
            log.info("queueItemNumber : ", queueItemNumber, " for Jenkins job : ", name);
            return { queueItemNumber }
        }).catch(err => {
            return formatJenkinsErrorPromise(err, name, params)
        });
}


// Check Job Exists
// *************************
/**
 * Assert the result of Job exist call request
 * @param name Jenkins Jobs Name
 * @returns {function(*=): *} Throw a exeption if exist function paramteer is false
 */
function assertJenkinsJobExist(name) {
    return function (exists) {
        if (!exists) {
            throw generateErrorNotJenkinsJob({name});
        }
        return exists;
    }
}

function generateErrorNotJenkinsJob({name}) {
    const err = new Error(`No Jenkins Job : ${name}`);
    err.statusCode = 404;
    err.detail = {
        jenkinsJob: name,
        errorCode : 'JENKINS_JOB_NOT_EXISTS',
        errorMsg: `Désolé, le Job Jenkins ${name} n'existe pas`
    };
    return err;
};

// Error Management
// *************************
function formatJenkinsErrorPromise(err, name, params) {
    try {
        log.error(err)
        log.error(err.statusMessage)

        // Add error detail
        err.detail = {
            jenkinsJob: name,
            params
        };
        // Parse Html Page for extract Error detail
        let errResBody = err.res ? err.res.body : undefined;
        if (!errResBody) {
            const stacktrace = parseJenkinsErrorPage(errResBody);
            err.detail.stacktrace = stacktrace;
        }
        throw err;
    } catch (errMangaError) {
        log.error("Error during catch the original Error", errMangaError);
        throw err;
    }
}

/**
 * Parse Jenkins Error Page
 * @param html The Jenkins HTML page response
 * @returns {string}
 */
function parseJenkinsErrorPage(html) {
    if (!html) return '';
    // Prepare Iteration
    let isBody = false;
    let isStacktrace = false;
    let divCount = 0;
    let stacktrace = "";
    const parser = new htmlparser.Parser({
        onopentag: function (name, attributes) {
            if (isBody) {
                if (name === "div") {
                    divCount += 1;
                    //log.debug('--- divCount OPEN = ', divCount);
                } else if (name === 'pre') {
                    isStacktrace = true;
                }
            } else if (name === "div" && 'error-description' === attributes.id) {
                isBody = true;
            }
        },
        ontext: function (text) {
            if (isStacktrace) {
                stacktrace += text;
                stacktrace += "/n";
            }
        },
        onclosetag: function (name) {
            if (name === "body") {
                isBody = false;
            }
            if (isBody) {
                if (name === 'div') {
                    divCount += -1;
                    //log.debug('--- divCount CLOSE = ', divCount);

                    if (divCount <= 0) {
                        isBody = false;
                    }
                } else if (name === 'pre') {
                    isStacktrace = false;
                }

            }
        }
    }, {decodeEntities: true});
    parser.write(html);
    parser.end();
    return stacktrace;
}


// Jenkins Apis
// *************************
function getAppJobCode(app) {
    const appCode = `${app}`.toLocaleUpperCase();
    return appCode
}

function deployRelease(app, version, env, deployDate) {
    const appCode = getAppJobCode(app);
    const name = `Deploy/deploy-${appCode}-pipeline`;
    return callJenkinsJob(name, {version, deployTo: getMenuEnvLabel(env), deployDate});
}

function compileApp(app) {
    const appCode = getAppJobCode(app);
    const name = `ci-${appCode}-branch-dev`;
    return callJenkinsJob(name);
}

function releaseApp(app, version) {
    const appCode = getAppJobCode(app);
    const name = `ci-${appCode}-branch-dev`;
    return callJenkinsJob(name, version);
}

module.exports = {
    deployRelease, compileApp, releaseApp
};
