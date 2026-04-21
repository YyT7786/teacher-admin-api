import { Router } from 'express';
import registerController from '../controllers/registerController';
import commonStudentsController from '../controllers/commonStudentsController';
import suspendController from '../controllers/suspendController';
import notificationController from '../controllers/notificationController';

const router = Router();

router.post('/register', registerController);
router.get('/commonstudents', commonStudentsController);
router.post('/suspend', suspendController);
router.post('/retrievefornotifications', notificationController);

export default router;
