import * as configService from '../services/configService.js';
import { randomUUID } from 'crypto';
import db from '../db.js';

// ── Recommendations (SQLite) ──────────────────────────────────────────────────

function parseRec(row) {
  if (!row) return null;
  return {
    ...row,
    suggestedKeywords: row.suggestedKeywords ? JSON.parse(row.suggestedKeywords) : [],
  };
}

function getAllRecs() {
  return db.prepare('SELECT * FROM recommendations ORDER BY createdAt DESC').all().map(parseRec);
}

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/config
 */
export async function getConfig(req, res, next) {
  try {
    const config = await configService.getSafeConfig();
    res.json(config);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/config
 */
export async function updateConfig(req, res, next) {
  try {
    const patch = req.body ?? {};
    await configService.updateConfig(patch);
    const safe = await configService.getSafeConfig();
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/config/recommendations
 */
export async function getRecommendations(req, res, next) {
  try {
    res.json(getAllRecs());
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/config/recommendations/:id
 * Body: { status: 'accepted' | 'dismissed' }
 */
export async function updateRecommendation(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!['accepted', 'dismissed'].includes(status)) {
      return res.status(400).json({
        error: { code: 'INVALID_STATUS', message: "status must be 'accepted' or 'dismissed'" },
      });
    }

    const existing = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: `Recommendation not found: ${id}` } });
    }

    const now = Date.now();
    const suppressUntil = status === 'dismissed' ? now + 7 * 24 * 60 * 60 * 1000 : existing.suppressUntil;

    db.prepare(
      'UPDATE recommendations SET status = @status, suppressUntil = @suppressUntil, updatedAt = @updatedAt WHERE id = @id'
    ).run({ id, status, suppressUntil, updatedAt: now });

    res.json(parseRec(db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id)));
  } catch (err) {
    next(err);
  }
}
