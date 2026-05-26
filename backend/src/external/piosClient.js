import 'dotenv/config';
import { randomUUID } from 'crypto';

function getBaseUrl() {
  const url = process.env.PIOS_API_BASE_URL;
  if (!url) {
    throw new Error(
      'πOS API is not configured: PIOS_API_BASE_URL is not set. ' +
      'Please configure it in .env or via the /api/config endpoint.'
    );
  }
  return url.replace(/\/$/, '');
}

function getHeaders(extra = {}) {
  const token = process.env.PIOS_API_TOKEN;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(method, path, body, extraHeaders = {}) {
  const url = `${getBaseUrl()}${path}`;
  const options = {
    method,
    headers: getHeaders(extraHeaders),
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`πOS API error ${response.status} ${method} ${path}: ${errorText}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * GET /api/v1/tasks
 */
export async function fetchTasks() {
  return request('GET', '/api/v1/tasks');
}

/**
 * POST /api/v1/tasks
 */
export async function createTask(taskData) {
  const idempotencyKey = randomUUID();
  return request('POST', '/api/v1/tasks', taskData, {
    'Idempotency-Key': idempotencyKey,
  });
}

/**
 * PATCH /api/v1/tasks/:id
 */
export async function updateTask(id, patch) {
  return request('PATCH', `/api/v1/tasks/${id}`, patch);
}

/**
 * DELETE /api/v1/tasks/:id
 */
export async function deleteTask(id) {
  return request('DELETE', `/api/v1/tasks/${id}`);
}

/**
 * POST /api/v1/pipelines/:id/trigger
 * @returns {{ executionId: string }}
 */
export async function triggerPipeline(pipelineId) {
  return request('POST', `/api/v1/pipelines/${pipelineId}/trigger`);
}

/**
 * GET /api/v1/pipelines/:id/executions/:execId
 */
export async function getExecutionStatus(pipelineId, executionId) {
  return request('GET', `/api/v1/pipelines/${pipelineId}/executions/${executionId}`);
}

/**
 * POST /api/v1/pipelines
 * @returns {{ pipelineId: string }}
 */
export async function createPipeline(name) {
  return request('POST', '/api/v1/pipelines', { name });
}
