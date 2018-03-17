const pkginfo = require('../../package.json');


exports.welcome = ctx => {
    // BUSINESS LOGIC
    const data = {
        name: pkginfo.name,
        version: pkginfo.version,
        description: pkginfo.description,
        author: pkginfo.author
    };
    ctx.body = data;
    //ctx.res.ok(data, 'Hello, API!');
};