import * as aiService from '../services/aiService.js';
import * as routerService from '../services/routerService.js';
import * as recommendationService from '../services/recommendationService.js';
import * as taskService from '../services/taskService.js';
import * as configService from '../services/configService.js';
import { readFile, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECS_FILE = resolve(__dirname, '../../data/recommendations.json');

async function readRecommendations() {
  try {
    const raw = await readFile(RECS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeRecommendations(recs) {
  await writeFile(RECS_FILE, JSON.stringify(recs, null, 2), 'utf-8');
}

/**
 * POST /api/ai/decompose
 * Body: { input: string, source?: string }
 */
export async function decompose(req, res, next) {
  try {
    const { input, source } = req.body ?? {};
    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'input is required' } });
    }

    const result = await aiService.decompose(input.trim(), source);
    res.json(result); // { tasks, isFallback }
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/route
 * Body: { taskName: string }
 */
export async function route(req, res, next) {
  try {
    const { taskName } = req.body ?? {};
    if (!taskName || typeof taskName !== 'string' || !taskName.trim()) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'taskName is required' } });
    }

    const config = await configService.getConfig();
    const pipelineId = await routerService.match(taskName.trim(), config);
    res.json({ pipelineId });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/ai/analyze
 */
export async function analyze(req, res, next) {
  try {
    const [tasks, config, existingRecs] = await Promise.all([
      taskService.getAll(),
      configService.getConfig(),
      readRecommendations(),
    ]);

    const newRecs = await recommendationService.analyze(tasks, config, existingRecs);

    if (newRecs && newRecs.length > 0) {
      const merged = [...existingRecs, ...newRecs];
      await writeRecommendations(merged);

      // Update analyzerLastRunAt in config
      await configService.updateConfig({ analyzerLastRunAt: Date.now() });

      return res.json({ recommendations: newRecs });
    }

    res.json({ recommendations: [] });
  } catch (err) {
    next(err);
  }
}
