import 'dotenv/config';
import { randomUUID } from 'crypto';
import db from '../db.js';
import * as piosClient from '../external/piosClient.js';

function isPiosConfigured() {
  return Boolean(process.env.PIOS_API_BASE_URL);
}

// ── SQLite helpers ────────────────────────────────────────────────────────────

const COLUMNS = [
  'id', 'name', 'status', 'priority', 'category', 'timeLabel', 'dueAt',
  'source', 'pipelineId', 'executionId', 'pipelineStatus', 'completedAt',
  'createdAt', 'updatedAt',
];

function rowToTask(row) {
  if (!row) return null;
  return row;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAll() {
  if (isPiosConfigured()) {
    return piosClient.fetchTasks();
  }
  return db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
}

export async function create(taskData) {
  if (isPiosConfigured()) {
    return piosClient.createTask(taskData);
  }

  const now = Date.now();
  const task = {
    id: taskData.id ?? `task_${now}_${randomUUID().slice(0, 8)}`,
    name: taskData.name ?? '',
    status: taskData.status ?? 'pending',
    priority: taskData.priority ?? 'medium',
    category: taskData.category ?? null,
    timeLabel: taskData.timeLabel ?? null,
    dueAt: taskData.dueAt ?? null,
    source: taskData.source ?? null,
    pipelineId: taskData.pipelineId ?? null,
    executionId: taskData.executionId ?? null,
    pipelineStatus: taskData.pipelineStatus ?? null,
    completedAt: taskData.completedAt ?? null,
    createdAt: taskData.createdAt ?? now,
    updatedAt: taskData.updatedAt ?? null,
  };

  db.prepare(`
    INSERT INTO tasks (${COLUMNS.join(', ')})
    VALUES (${COLUMNS.map((c) => `@${c}`).join(', ')})
  `).run(task);

  return task;
}

export async function update(id, patch) {
  if (isPiosConfigured()) {
    return piosClient.updateTask(id, patch);
  }

  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error(`Task not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }

  const allowed = new Set(COLUMNS.filter((c) => !['id', 'createdAt'].includes(c)));
  const fields = Object.keys(patch).filter((k) => allowed.has(k));
  if (fields.length === 0) return existing;

  const updatedAt = Date.now();
  const setClause = [...fields, 'updatedAt'].map((f) => `${f} = @${f}`).join(', ');
  const params = { ...patch, id, updatedAt };

  db.prepare(`UPDATE tasks SET ${setClause} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export async function remove(id) {
  if (isPiosConfigured()) {
    return piosClient.deleteTask(id);
  }

  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    const err = new Error(`Task not found: ${id}`);
    err.statusCode = 404;
    throw err;
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
}
