import db from '../db.js';

/**
 * SQL-based recommendation service (no AI).
 * SRS FR-17/FR-18/FR-19, NFR-02
 */

/**
 * Returns at most 1 pipeline recommendation based on:
 *  1. trigger_count >= 3 AND last_triggered_at within the last 7 days
 *  2. Excludes pipelines suppressed (useful=0 feedback) within last 7 days
 *  3. Excludes pipelines with any feedback (useful=1) created within last 24h
 *     (used as a proxy for "recommended in last 24h")
 *  4. Returns the one with the highest trigger_count
 *
 * @returns {{ pipeline_id: string, display_name: string, trigger_count: number, last_triggered_at: string }[]}
 */
export function getRecommendation() {
  const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const ONE_DAY_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const row = db
    .prepare(
      `
      SELECT
        pc.pipeline_id,
        pc.display_name,
        ps.trigger_count,
        ps.last_triggered_at
      FROM pipeline_configs AS pc
      JOIN pipeline_stats AS ps ON ps.pipeline_id = pc.pipeline_id
      WHERE
        -- Filter 1: triggered >= 3 times and recently active within 7 days
        ps.trigger_count >= 3
        AND ps.last_triggered_at >= @seven_days_ago

        -- Filter 2: exclude suppressed pipelines (useful=0 feedback within 7 days)
        AND pc.pipeline_id NOT IN (
          SELECT pipeline_id
          FROM recommendation_feedback
          WHERE useful = 0
            AND created_at >= @seven_days_ago
        )

        -- Filter 3: exclude pipelines with positive feedback within last 24h
        --           (proxy for "already recommended in last 24h")
        AND pc.pipeline_id NOT IN (
          SELECT pipeline_id
          FROM recommendation_feedback
          WHERE useful = 1
            AND created_at >= @one_day_ago
        )

      ORDER BY ps.trigger_count DESC
      LIMIT 1
    `
    )
    .get({ seven_days_ago: SEVEN_DAYS_AGO, one_day_ago: ONE_DAY_AGO });

  return row ? [row] : [];
}

/**
 * Records user feedback for a pipeline recommendation.
 *
 * @param {string} pipeline_id
 * @param {boolean} useful
 * @returns {{ ok: true }}
 */
export function recordFeedback(pipeline_id, useful) {
  db.prepare(
    `INSERT INTO recommendation_feedback (pipeline_id, useful, created_at)
     VALUES (@pipeline_id, @useful, @created_at)`
  ).run({
    pipeline_id,
    useful: useful ? 1 : 0,
    created_at: new Date().toISOString(),
  });

  return { ok: true };
}
