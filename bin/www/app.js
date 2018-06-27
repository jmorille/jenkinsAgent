
const  app = require('../../src/server');

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), function() {
    console.info('Jenkins Agent server listening on port ' + server.address().port);
});