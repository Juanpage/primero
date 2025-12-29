import { Router } from 'express';
import { getOverview, getByVessel } from '../controllers/metrics.controller.js';

const router = Router();

router.get('/metrics/overview', getOverview);
router.get('/metrics/by-vessel', getByVessel);

export default router;
