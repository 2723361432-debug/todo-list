import * as sqlRecommendationService from '../services/sqlRecommendationService.js';

/**
 * GET /api/recommendations
 * Returns at most 1 recommendation card based on pipeline trigger statistics.
 * SRS FR-17
 */
export function getRecommendations(req, res, next) {
  try {
    const result = sqlRecommendationService.getRecommendation();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/recommendations/feedback
 * Body: { pipeline_id: string, useful: boolean }
 * Inserts feedback into recommendation_feedback table.
 * SRS FR-18/FR-19
 */
export function postFeedback(req, res, next) {
  try {
    const { pipeline_id, useful } = req.body ?? {};

    if (!pipeline_id || typeof pipeline_id !== 'string' || pipeline_id.trim() === '') {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'pipeline_id is required' },
      });
    }

    if (useful === undefined || useful === null) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'useful field is required' },
      });
    }

    const result = sqlRecommendationService.recordFeedback(pipeline_id.trim(), Boolean(useful));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
