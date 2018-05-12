const log = require('./logger');

const server = require('./server');


server.listen(3000, ()=> {
    log.info('Server listening http://localhost:3000')
});
