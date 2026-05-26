import { Router } from 'express';
import { listConfigs, createConfig, deleteConfig } from '../controllers/pipelineConfigController.js';

const router = Router();

router.get('/', listConfigs);
router.post('/', createConfig);
router.delete('/:id', deleteConfig);

export default router;
