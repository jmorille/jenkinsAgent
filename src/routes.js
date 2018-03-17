
const Router = require('koa-router');
const homeController = require('./controllers/home');
const dialogController = require('./controllers/dialogflow');

const router = new Router();

router.get('/', homeController.welcome);
router.get('/dialog', dialogController.index);
router.post('/dialog', dialogController.intent);



module.exports = router;
