import 'dotenv/config';
import db from '../db.js';

const DEFAULTS = {
  defaultPipelineId: '',
  keywordRules: [],
  pollingInterval: 5000,
  analyzerWindowDays: 7,
  analyzerFrequencyThreshold: 5,
  analyzerThrottleMs: 3600000,
  analyzerLastRunAt: 0,
};

// ── SQLite helpers ────────────────────────────────────────────────────────────

function readConfigFromDb() {
  const rows = db.prepare('SELECT key, value FROM config').all();
  const stored = {};
  for (const { key, value } of rows) {
    try {
      stored[key] = JSON.parse(value);
    } catch {
      stored[key] = value;
    }
  }
  return stored;
}

const upsertStmt = db.prepare(
  'INSERT INTO config (key, value) VALUES (@key, @value) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
);

function writeConfigToDb(patch) {
  const insert = db.transaction((entries) => {
    for (const [key, val] of entries) {
      upsertStmt.run({ key, value: JSON.stringify(val) });
    }
  });
  insert(Object.entries(patch));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getConfig() {
  const stored = readConfigFromDb();
  return {
    ...DEFAULTS,
    ...stored,
    aiApiBaseUrl: stored.aiApiBaseUrl ?? process.env.AI_API_BASE_URL ?? '',
    aiApiKey: stored.aiApiKey ?? process.env.AI_API_KEY ?? '',
    aiModel: stored.aiModel ?? process.env.AI_MODEL ?? 'gpt-4o-mini',
    piosApiBaseUrl: stored.piosApiBaseUrl ?? process.env.PIOS_API_BASE_URL ?? '',
    piosApiToken: stored.piosApiToken ?? process.env.PIOS_API_TOKEN ?? '',
  };
}

export async function updateConfig(patch) {
  writeConfigToDb(patch);

  if (patch.aiApiBaseUrl) process.env.AI_API_BASE_URL = patch.aiApiBaseUrl;
  if (patch.aiApiKey) process.env.AI_API_KEY = patch.aiApiKey;
  if (patch.aiModel) process.env.AI_MODEL = patch.aiModel;
  if (patch.piosApiBaseUrl) process.env.PIOS_API_BASE_URL = patch.piosApiBaseUrl;
  if (patch.piosApiToken) process.env.PIOS_API_TOKEN = patch.piosApiToken;

  return getConfig();
}

export async function getSafeConfig() {
  const config = await getConfig();
  // Destructure all known sensitive key variants (camelCase + snake_case stored in DB)
  const { aiApiKey, piosApiToken, pios_token, ...safe } = config;
  return {
    ...safe,
    hasApiKey: Boolean(aiApiKey),
    hasPiosToken: Boolean(piosApiToken) || Boolean(pios_token),
  };
}
