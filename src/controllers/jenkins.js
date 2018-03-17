const jenkinsConfig = require("../config/jenkins.json");
const jenkins = require('jenkins')(jenkinsConfig);


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


exports.jobBuild = async ctx => {
    const opt = {
        name: "deploy-HDF-release"
    }
    await jenkins.job.build(opt).then(res => {
        ctx.body = res
    });
};