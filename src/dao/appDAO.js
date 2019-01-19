// log
const log = require('../logger');

const data = require('../config/dory.json');


function listApps() {
    return Object.entries(data).map(item => {
        return { name:item[0],   ...item[1] };
    });
}


function getApps() {
    return new Promise((resolve, reject) => {
        const result = listApps();
        resolve(result);
    });
}

function getAppById(id) {
    return new Promise((resolve, reject) => {
        const result = data[id];
        resolve(result);
    });
}

module.exports = {
    getApps, getAppById
};

