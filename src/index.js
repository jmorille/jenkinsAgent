const log = require('./logger');

const server = require('./server');
const serverKoa = require('./serverKoa');


server.listen(3000, ()=> {
    log.info('Server listening http://localhost:3000')
});


serverKoa.listen(4000, ()=> {
    log.info('Server listening http://localhost:4000')
});

