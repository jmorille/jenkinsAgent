
const Router = require('koa-router');
const homeController = require('./controllers/home');
const dialogController = require('./controllers/dialogflow');
const jenkinsController = require('./controllers/jenkins');

const router = new Router();

router.get('/', homeController.welcome);

router.get('/dialog', dialogController.index);
router.post('/dialog', dialogController.intent);


router.get('/jenkins/info', jenkinsController.info);
router.get('/jenkins/jobs', jenkinsController.jobList);
router.get('/jenkins/job/build', jenkinsController.jobBuild);



module.exports = router;
