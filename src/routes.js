const basicAuth = require('koa-http-basic-auth');



const Router = require('koa-router');
const homeController = require('./controllers/home');
const dialogController = require('./controllers/dialogflow');
const dialogQueryController = require('./controllers/dialogflowQuery');
const jenkinsRouter = require('./controllers/jenkins').router;
const appVersionRouter = require('./controllers/appVersionControler');

// Configure router
const router = new Router();
const authCheck = basicAuth({
    user: 'dialogflow', // required
        pass: "Et bien qu'attend tu, achève le", // required
    realm: 'Authorization', // optional, defaults to 'Authorization required'
});
router.use(authCheck);

// Routes
router.get('/', homeController.welcome);

router.get('/dialog', dialogController.index);
router.post('/dialog', dialogController.intent);

//router.get('/dialog/query', dialogQueryController.query);


[jenkinsRouter,appVersionRouter].forEach(elt => {
    router.use(elt.routes(), elt.allowedMethods());
});


module.exports = router;
