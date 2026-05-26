import * as piosClient from '../external/piosClient.js';
import * as taskService from '../services/taskService.js';

/**
 * POST /api/pipelines/trigger
 * Body: { pipelineId: string }
 */
export async function triggerPipeline(req, res, next) {
  try {
    const { pipelineId } = req.body ?? {};
    if (!pipelineId) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'pipelineId is required' } });
    }

    const result = await piosClient.triggerPipeline(pipelineId);
    res.json(result); // { executionId }
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pipelines/:pipelineId/executions/:executionId
 */
export async function getExecutionStatus(req, res, next) {
  try {
    const { pipelineId, executionId } = req.params;
    const result = await piosClient.getExecutionStatus(pipelineId, executionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/pipelines
 * Body: { name: string }
 * G-05: createPipeline must succeed before returning pipelineId (atomic)
 */
export async function createPipeline(req, res, next) {
  try {
    const { name } = req.body ?? {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'name is required' } });
    }

    // G-05: createPipeline must succeed; only return on success
    const result = await piosClient.createPipeline(name.trim());

    if (!result?.pipelineId) {
      throw new Error('createPipeline did not return a pipelineId');
    }

    res.status(201).json({ pipelineId: result.pipelineId });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pipeline/status-stream
 * SSE endpoint: polls pending tasks every 5s and streams task updates.
 */
export async function statusStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  const POLL_INTERVAL_MS = 5000;

  async function sendUpdate() {
    try {
      const tasks = await taskService.getAll();
      const pending = Array.isArray(tasks)
        ? tasks.filter((t) => t.status === 'pending' || t.status === 'running')
        : [];

      const payload = JSON.stringify({ tasks: pending, timestamp: Date.now() });
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      const errPayload = JSON.stringify({ error: err.message, timestamp: Date.now() });
      res.write(`data: ${errPayload}\n\n`);
    }
  }

  // Send initial update immediately
  await sendUpdate();

  const interval = setInterval(sendUpdate, POLL_INTERVAL_MS);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });

  req.on('error', () => {
    clearInterval(interval);
  });
}
