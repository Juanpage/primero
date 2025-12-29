import express from 'express';
import { submitFeedback, getDashboardStats, exportCsv } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/feedback', submitFeedback);
router.get('/admin/summary', getDashboardStats);
router.get('/admin/export', exportCsv);

export default router;
