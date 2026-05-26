import { Router } from 'express';
import { decompose, route, analyze } from '../controllers/aiController.js';

const router = Router();

router.post('/decompose', decompose);
router.post('/route', route);
router.post('/analyze', analyze);

export default router;
