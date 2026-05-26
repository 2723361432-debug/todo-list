import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import taskRoutes from './routes/tasks.js';
import aiRoutes from './routes/ai.js';
import pipelineRoutes, { statusStream } from './routes/pipelines.js';
import configRoutes from './routes/config.js';
import recommendationRoutes from './routes/recommendations.js';
import pipelineConfigRoutes from './routes/pipeline-configs.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pipelines', pipelineRoutes);
app.use('/api/config', configRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/pipeline-configs', pipelineConfigRoutes);

// SSE status stream — separate path prefix to avoid conflict with /api/pipelines
app.get('/api/pipeline/status-stream', statusStream);

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ── Global error handler ──────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const code = err.code ?? (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR');
  const message = err.message ?? 'An unexpected error occurred';

  if (statusCode >= 500) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    error: { code, message },
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
  console.log(`[server] Accepting requests from ${FRONTEND_URL}`);
  console.log(`[server] AI API: ${process.env.AI_API_BASE_URL ? 'configured' : 'NOT configured'}`);
  console.log(`[server] πOS API: ${process.env.PIOS_API_BASE_URL ? 'configured' : 'using local JSON fallback'}`);
});

export default app;
