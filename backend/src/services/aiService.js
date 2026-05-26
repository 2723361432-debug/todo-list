import { chatCompletion } from '../external/aiClient.js';

const DECOMPOSE_SYSTEM_PROMPT = `你是智能任务拆解助手。将用户的目标拆解为3～8条具体可执行的待办任务。
严格只输出JSON数组，每个元素：
[{"text":"原始表达","correctedText":"纠错后","priority":"high|medium|low","category":"工作|学习|生活|其他","timeLabel":"明天下午3点","dueAt":1716962400000}]
规则：text和correctedText必须存在；dueAt只在能确定精确时间戳时填写；每条不超过50字`;

/**
 * Parse a JSON array from raw AI text, stripping markdown fences if present.
 * @param {string} raw
 * @returns {Array}
 */
function parseJsonArray(raw) {
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('Expected JSON array');
  return parsed;
}

/**
 * Fallback: split input by sentence/comma/semicolon into basic DecomposedTask items.
 * @param {string} input
 * @returns {Array<DecomposedTask>}
 */
function fallbackSplit(input) {
  const parts = input
    .split(/[，,；;。\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const items = parts.length > 0 ? parts : [input.trim()];
  return items.map((text) => ({
    text,
    correctedText: text,
    priority: 'medium',
    category: '其他',
  }));
}

/**
 * Decompose a user input string into structured DecomposedTask items.
 * G-07: always returns { tasks, isFallback }.
 *
 * @param {string} input
 * @param {string} [source]
 * @returns {Promise<{ tasks: Array, isFallback: boolean }>}
 */
export async function decompose(input, source) {
  try {
    const messages = [
      { role: 'system', content: DECOMPOSE_SYSTEM_PROMPT },
      { role: 'user', content: input },
    ];

    const raw = await chatCompletion(messages, 0.4);
    const parsed = parseJsonArray(raw);

    // G-07: enforce text + correctedText on every item
    const tasks = parsed.map((item) => ({
      text: item.text ?? input,
      correctedText: item.correctedText ?? item.text ?? input,
      priority: item.priority ?? 'medium',
      category: item.category ?? '其他',
      ...(item.timeLabel ? { timeLabel: item.timeLabel } : {}),
      ...(item.dueAt ? { dueAt: item.dueAt } : {}),
    }));

    return { tasks, isFallback: false };
  } catch (err) {
    // AI unavailable or parse error → graceful fallback
    console.warn('[aiService.decompose] falling back due to error:', err.message);
    return { tasks: fallbackSplit(input), isFallback: true };
  }
}

/**
 * Ask AI to classify which pipeline best matches a task name.
 * Returns a pipelineId string or null.
 *
 * @param {string} taskName
 * @param {string[]} pipelineIds
 * @returns {Promise<string|null>}
 */
export async function classifyPipeline(taskName, pipelineIds) {
  if (!pipelineIds || pipelineIds.length === 0) return null;

  const systemPrompt = `你是任务分类助手。根据任务名称，从给定的流水线ID列表中选择最合适的一个。
严格只输出一个ID字符串（不含引号、无其他内容），若都不合适则输出 null。
流水线列表：${pipelineIds.join(', ')}`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: taskName },
    ];

    const raw = await chatCompletion(messages, 0);
    const result = raw.trim();

    if (result === 'null' || result === '') return null;
    if (pipelineIds.includes(result)) return result;
    return null;
  } catch (err) {
    console.warn('[aiService.classifyPipeline] error:', err.message);
    return null;
  }
}

/**
 * Batch-generate task recommendations from frequency patterns.
 * Returns an array of recommendation objects.
 *
 * @param {string[]} patterns - N-gram patterns identified as frequent
 * @returns {Promise<Array>}
 */
export async function generateRecommendations(patterns) {
  if (!patterns || patterns.length === 0) return [];

  const systemPrompt = `你是任务推荐助手。根据用户的高频任务关键词，生成具体可执行的任务推荐。
严格只输出JSON数组，每个元素格式：
[{"id":"rec_唯一ID","text":"推荐任务描述","reason":"基于高频关键词xxx推荐","priority":"high|medium|low","category":"工作|学习|生活|其他"}]
每条推荐不超过50字，最多生成5条。`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `高频关键词：${patterns.join('、')}` },
    ];

    const raw = await chatCompletion(messages, 0);
    const parsed = parseJsonArray(raw);

    return parsed.map((item, i) => ({
      id: item.id ?? `rec_${Date.now()}_${i}`,
      text: item.text ?? '',
      reason: item.reason ?? '',
      priority: item.priority ?? 'medium',
      category: item.category ?? '其他',
      status: 'pending',
      createdAt: Date.now(),
    }));
  } catch (err) {
    console.warn('[aiService.generateRecommendations] error:', err.message);
    return [];
  }
}
