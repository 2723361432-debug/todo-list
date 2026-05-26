import { Router } from 'express';
import {
  getConfig,
  updateConfig,
  getRecommendations,
  updateRecommendation,
} from '../controllers/configController.js';

const router = Router();

router.get('/', getConfig);
router.patch('/', updateConfig);
router.get('/recommendations', getRecommendations);
router.patch('/recommendations/:id', updateRecommendation);

export default router;
