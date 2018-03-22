
const Router = require('koa-router');
const homeController = require('./controllers/home');
const dialogController = require('./controllers/dialogflow');
const dialogQueryController = require('./controllers/dialogflowQuery');
const jenkinsRouter = require('./controllers/jenkins').router;

const router = new Router();

router.get('/', homeController.welcome);

router.get('/dialog', dialogController.index);
router.post('/dialog', dialogController.intent);

router.get('/dialog/query', dialogQueryController.query);


router.use(jenkinsRouter.routes(), jenkinsRouter.allowedMethods());



module.exports = router;
