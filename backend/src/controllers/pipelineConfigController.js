import * as pipelineConfigService from '../services/pipelineConfigService.js';

export function listConfigs(req, res, next) {
  try {
    res.json(pipelineConfigService.getAll());
  } catch (err) {
    next(err);
  }
}

export function createConfig(req, res, next) {
  try {
    const { pipeline_id, display_name, api_base_url } = req.body ?? {};
    if (!pipeline_id) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'pipeline_id is required' } });
    }

    const record = pipelineConfigService.create(pipeline_id, display_name, api_base_url);
    res.status(201).json(record);
  } catch (err) {
    if (err.code === 'CONFLICT') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: err.message } });
    }
    next(err);
  }
}

export function deleteConfig(req, res, next) {
  try {
    const { id } = req.params;
    pipelineConfigService.remove(id);
    res.status(204).end();
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    }
    next(err);
  }
}
