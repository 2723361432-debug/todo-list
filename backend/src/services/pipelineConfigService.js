import db from '../db.js';

const selectAll = db.prepare('SELECT * FROM pipeline_configs ORDER BY created_at DESC');
const selectById = db.prepare('SELECT * FROM pipeline_configs WHERE pipeline_id = ?');
const insertConfig = db.prepare(
  'INSERT INTO pipeline_configs (pipeline_id, display_name, api_base_url) VALUES (@pipeline_id, @display_name, @api_base_url)'
);
const insertStats = db.prepare(
  'INSERT INTO pipeline_stats (pipeline_id, trigger_count, last_triggered_at) VALUES (@pipeline_id, 0, NULL)'
);
const selectStats = db.prepare('SELECT id FROM pipeline_stats WHERE pipeline_id = ? LIMIT 1');
const deleteConfig = db.prepare('DELETE FROM pipeline_configs WHERE pipeline_id = ?');

const updateTrigger = db.prepare(
  'UPDATE pipeline_stats SET trigger_count = trigger_count + 1, last_triggered_at = @now WHERE pipeline_id = @pipeline_id'
);

export function getAll() {
  return selectAll.all();
}

export function create(pipeline_id, display_name, api_base_url) {
  const existing = selectById.get(pipeline_id);
  if (existing) {
    const err = new Error('pipeline_id already exists');
    err.code = 'CONFLICT';
    throw err;
  }

  db.transaction(() => {
    insertConfig.run({ pipeline_id, display_name: display_name ?? null, api_base_url: api_base_url ?? null });
    if (!selectStats.get(pipeline_id)) {
      insertStats.run({ pipeline_id });
    }
  })();

  return selectById.get(pipeline_id);
}

export function remove(pipeline_id) {
  const existing = selectById.get(pipeline_id);
  if (!existing) {
    const err = new Error('pipeline_id not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  deleteConfig.run(pipeline_id);
}

export function recordTrigger(pipeline_id) {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  if (!selectStats.get(pipeline_id)) {
    insertStats.run({ pipeline_id });
  }
  updateTrigger.run({ pipeline_id, now });
}
