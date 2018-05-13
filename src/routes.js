const express = require('express');

// Configure router
const router = module.exports =  new express.Router();

const dialog = require('./dialog/index');

const packageInfo = require('../package.json');

// Welcome page
router.get('/',   (req, res) => {
    res.json({
        name: packageInfo.name,
        version: packageInfo.version,
        description: packageInfo.description
    });
});


// Dialogflow
router.post('/', dialog);


