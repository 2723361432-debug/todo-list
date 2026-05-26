import { classifyPipeline } from './aiService.js';

/**
 * 3-stage pipeline routing.
 *
 * Stage 1 – Keyword match: check config.keywordRules (sorted by priority desc),
 *            case-insensitive substring match.
 * Stage 2 – AI classify: if AI API key is available, ask AI to pick a pipelineId.
 * Stage 3 – Default: return config.defaultPipelineId or null.
 *
 * @param {string} taskName
 * @param {object} config
 * @returns {Promise<string|null>} matched pipelineId or null
 */
export async function match(taskName, config) {
  const name = (taskName ?? '').toLowerCase();

  // Stage 1: keyword rules
  const rules = Array.isArray(config?.keywordRules) ? config.keywordRules : [];
  const sortedRules = [...rules].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  for (const rule of sortedRules) {
    if (!rule.keyword || !rule.pipelineId) continue;
    if (name.includes(rule.keyword.toLowerCase())) {
      return rule.pipelineId;
    }
  }

  // Stage 2: AI classify
  const aiApiKey = process.env.AI_API_KEY;
  if (aiApiKey) {
    const allPipelineIds = [
      ...new Set(
        sortedRules
          .map((r) => r.pipelineId)
          .filter(Boolean)
          .concat(config?.defaultPipelineId ? [config.defaultPipelineId] : [])
      ),
    ];

    if (allPipelineIds.length > 0) {
      try {
        const aiResult = await classifyPipeline(taskName, allPipelineIds);
        if (aiResult) return aiResult;
      } catch (err) {
        console.warn('[routerService] AI classify failed, falling through to default:', err.message);
      }
    }
  }

  // Stage 3: default
  return config?.defaultPipelineId || null;
}
