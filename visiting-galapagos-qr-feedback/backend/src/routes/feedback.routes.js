import { Router } from 'express';
import { createFeedback, listFeedback } from '../controllers/feedback.controller.js';

const router = Router();

router.post('/feedback', createFeedback);
router.get('/feedback', listFeedback);

export default router;
