import { Router } from 'express';
import {
  triggerPipeline,
  getExecutionStatus,
  createPipeline,
  statusStream,
} from '../controllers/pipelineController.js';

const router = Router();

// SSE status stream — mounted at /api/pipeline/status-stream in server.js
// (separate prefix; handled by the dedicated route mount below)

router.post('/trigger', triggerPipeline);
router.post('/', createPipeline);
router.get('/:pipelineId/executions/:executionId', getExecutionStatus);

export { statusStream };
export default router;
