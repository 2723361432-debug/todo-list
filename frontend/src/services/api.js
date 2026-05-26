const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || `HTTP ${res.status}`
    throw Object.assign(new Error(msg), { code: data?.error?.code, status: res.status })
  }
  return data
}

// Tasks
export const getTasks = () => request('/tasks')
export const createTask = (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) })
export const updateTask = (id, patch) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
export const deleteTask = (id) => request(`/tasks/${id}`, { method: 'DELETE' })

// AI
export const decomposeInput = (input, source = 'text') =>
  request('/ai/decompose', { method: 'POST', body: JSON.stringify({ input, source }) })

export const routeTask = (taskName) =>
  request('/ai/route', { method: 'POST', body: JSON.stringify({ taskName }) })

export const analyzePatterns = () => request('/ai/analyze', { method: 'POST' })

// Pipeline
export const triggerPipeline = (taskId, pipelineId) =>
  request('/pipeline/trigger', { method: 'POST', body: JSON.stringify({ taskId, pipelineId }) })

export const getPipelineStatus = (executionId) =>
  request(`/pipeline/status/${executionId}`)

export const createPipeline = (name, config) =>
  request('/pipeline/create', { method: 'POST', body: JSON.stringify({ name, config }) })

// Config
export const getConfig = () => request('/config')
export const updateConfig = (patch) =>
  request('/config', { method: 'PATCH', body: JSON.stringify(patch) })

export const getRecommendations = () => request('/config/recommendations')
export const acceptRecommendation = (id) =>
  request(`/config/recommendations/${id}/accept`, { method: 'POST' })
export const dismissRecommendation = (id) =>
  request(`/config/recommendations/${id}/dismiss`, { method: 'POST' })

// Pipeline configs
export const getPipelineConfigs = () => request('/pipeline-configs')
export const createPipelineConfig = (data) => request('/pipeline-configs', { method: 'POST', body: JSON.stringify(data) })
export const deletePipelineConfig = (pipelineId) => request(`/pipeline-configs/${pipelineId}`, { method: 'DELETE' })

// Recommendations (new separate endpoint)
export const getRecommendationsList = () => request('/recommendations')
export const submitRecommendationFeedback = (pipeline_id, useful) =>
  request('/recommendations/feedback', { method: 'POST', body: JSON.stringify({ pipeline_id, useful }) })

// Pipeline trigger (named export)
export const triggerPipelineById = (pipelineId, taskId = null) =>
  request('/pipelines/trigger', { method: 'POST', body: JSON.stringify({ pipelineId, taskId }) })
