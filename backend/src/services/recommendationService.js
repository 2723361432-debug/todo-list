import { generateRecommendations } from './aiService.js';

const STOP_WORDS = new Set([
  '的','了','在','是','我','有','和','就','不','人','都','一','上','也','很',
  '到','要','去','你','会','来','做','把','对','用','进行','完成','实现','处理',
  '检查','更新','添加','创建','配置','修改','优化','测试','部署',
]);

/**
 * Tokenize a task text into meaningful unigrams by stripping stop-words.
 * @param {string} text
 * @returns {string[]}
 */
function tokenize(text) {
  if (!text) return [];
  // Simple character-level split for Chinese; also split on whitespace/punctuation
  const chars = text.replace(/[，,。！？!?；;：:\s]/g, ' ').split(/\s+/).filter(Boolean);
  return chars.filter((c) => c.length >= 2 && !STOP_WORDS.has(c));
}

/**
 * Build N-gram (1 and 2) frequency map from a list of strings.
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
function buildNgrams(tokens) {
  const freq = new Map();
  for (let i = 0; i < tokens.length; i++) {
    // unigram
    const uni = tokens[i];
    freq.set(uni, (freq.get(uni) ?? 0) + 1);
    // bigram
    if (i + 1 < tokens.length) {
      const bi = `${tokens[i]} ${tokens[i + 1]}`;
      freq.set(bi, (freq.get(bi) ?? 0) + 1);
    }
  }
  return freq;
}

/**
 * Extract high-frequency N-gram patterns from recent tasks.
 * Private helper.
 *
 * @param {object[]} tasks
 * @param {object} config
 * @param {object[]} existingRecs - existing recommendations for cooldown check
 * @returns {string[]} pattern strings that exceed the frequency threshold
 */
function extractPatterns(tasks, config, existingRecs) {
  const windowDays = config?.analyzerWindowDays ?? 7;
  const threshold = config?.analyzerFrequencyThreshold ?? 5;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const cutoff = now - windowMs;

  // Filter tasks within the window
  const recentTasks = tasks.filter((t) => {
    const ts = t.createdAt ?? t.updatedAt ?? 0;
    return ts >= cutoff;
  });

  // Collect all tokens
  const allTokens = recentTasks.flatMap((t) => tokenize(t.text ?? t.title ?? t.correctedText ?? ''));
  const freq = buildNgrams(allTokens);

  // Build suppressed pattern set from existing recs (90-day cooldown + 7-day suppress)
  const cooldown90 = 90 * 24 * 60 * 60 * 1000;
  const suppress7 = 7 * 24 * 60 * 60 * 1000;
  const suppressedPatterns = new Set(
    (existingRecs ?? [])
      .filter((r) => {
        if (r.status === 'accepted' && now - (r.createdAt ?? 0) < cooldown90) return true;
        if (r.suppressUntil && now < r.suppressUntil) return true;
        if (r.status === 'dismissed' && now - (r.createdAt ?? 0) < suppress7) return true;
        return false;
      })
      .map((r) => r.sourcePattern)
      .filter(Boolean)
  );

  // Return patterns that meet the threshold and are not suppressed
  const result = [];
  for (const [pattern, count] of freq.entries()) {
    if (count >= threshold && !suppressedPatterns.has(pattern)) {
      result.push(pattern);
    }
  }

  return result;
}

/**
 * G-04 compliant FrequencyAnalyzer.
 * Gates AI calls with local stats first.
 *
 * @param {object[]} tasks
 * @param {object} config
 * @param {object[]} [existingRecs]
 * @returns {Promise<object[]|null>} new recommendations or null if throttled / no new patterns
 */
export async function analyze(tasks, config, existingRecs = []) {
  // G-04 Step 1: throttle gate — local check before any AI call
  const lastRunAt = config?.analyzerLastRunAt ?? 0;
  const throttleMs = config?.analyzerThrottleMs ?? 3600000;

  if (Date.now() - lastRunAt < throttleMs) {
    return null; // too soon — do not call AI
  }

  // G-04 Step 2: extract patterns locally
  const patterns = extractPatterns(tasks, config, existingRecs);

  if (patterns.length === 0) {
    return null; // nothing interesting — do not call AI
  }

  // G-04 Step 3: only now call AI
  const recommendations = await generateRecommendations(patterns);

  // Attach source pattern info for future cooldown tracking
  const tagged = recommendations.map((rec, i) => ({
    ...rec,
    sourcePattern: patterns[i] ?? patterns[0],
    status: 'pending',
    createdAt: Date.now(),
  }));

  return tagged;
}

export { extractPatterns };
