import { Router } from 'express';
import { getRecommendations, postFeedback } from '../controllers/recommendationController.js';

const router = Router();

// GET /api/recommendations — returns at most 1 recommendation card
router.get('/', getRecommendations);

// POST /api/recommendations/feedback — record user feedback
router.post('/feedback', postFeedback);

export default router;
