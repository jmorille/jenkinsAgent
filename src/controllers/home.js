
const pkginfo = require('../../package.json');


exports.welcome = ctx => {
    const data = {
        name: pkginfo.name,
        version: pkginfo.version,
        description: pkginfo.description,
        author: pkginfo.author
    };
    ctx.body = data;
};