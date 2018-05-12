const express = require('express');

// Configure router
const router = new express.Router();

const dialog = require('./dialog/index');

// Welcome page
router.get('/', (req, res) => {
    res.send({
        greeting: 'hello world'
    });
});

// Dialogflow
router.post('/', dialog);


module.exports = router;
