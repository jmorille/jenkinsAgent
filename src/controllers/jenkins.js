const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(Object.assign({},jenkinsConfig));


exports.info = async ctx => {
    await jenkins.info().then(res => {
        ctx.body = res
    });
};

exports.jobList = async ctx => {
    await jenkins.job.list().then(res => {
        ctx.body = res
    });
};

function deployJobName(app) {
    return `deploy-${app}-release`;
}

exports.jobBuild = async ctx => {
    const name = deployJobName('HDF');
    await jenkins.job.build({name}).then(res => {
        ctx.body = res

    });
};


exports.jobCopy = async ctx => {
    const from = deployJobName('HDF');
    const to = deployJobName('PHP-MONITOR');
    await jenkins.job.copy(from, to).then(res => {
        ctx.body = {
            from, to
        }
    });
}
