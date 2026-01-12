import express from 'express';
import { createFeedback, listFeedback, manageFeedback } from '../controllers/feedbackController.js';
import { qrAuth } from '../middleware/qrAuth.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
const max = Number(process.env.RATE_LIMIT_MAX || 30);

router.post('/', rateLimit(windowMs, max), qrAuth, createFeedback);
router.get('/', listFeedback);
router.patch('/:id/manage', manageFeedback);

export default router;
