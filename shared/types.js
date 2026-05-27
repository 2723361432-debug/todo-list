/**
 * @fileoverview Shared JSDoc type definitions for the Smart Todo system.
 *
 * All types are derived from the actual SQLite schema (db.js) and service
 * implementations.  Import these JSDoc typedefs into any JS/TS file that
 * needs IntelliSense support.
 *
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────────────────────────
// Core entities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single to-do task.
 *
 * Stored in the `tasks` SQLite table.  Timestamps are Unix epoch milliseconds
 * (INTEGER) when written by the Node backend; ISO-8601 strings when proxied
 * from the πOS API.
 *
 * @typedef {Object} Task
 * @property {string}  id             - Unique identifier (e.g. "task_1716700000000_a1b2c3d4").
 * @property {string}  name           - Primary display name / description of the task.
 * @property {string|null} title      - Optional secondary title (alias used by πOS proxy).
 * @property {'pending'|'running'|'completed'|'failed'} status - Current lifecycle status.
 * @property {'low'|'medium'|'high'} [priority='medium'] - Task priority.
 * @property {string|null} [category] - User-defined category label.
 * @property {string|null} [timeLabel] - Human-readable time bucket (e.g. "today", "this week").
 * @property {number|null} [dueAt]    - Due timestamp (Unix ms).
 * @property {string|null} [source]   - Origin identifier (e.g. "manual", "pipeline").
 * @property {string|null} [pipeline_id] - Associated pipeline ID (snake_case column alias).
 * @property {string|null} [pipelineId]  - Associated pipeline ID (camelCase field from service).
 * @property {string|null} [executionId] - Pipeline execution ID linked to this task.
 * @property {string|null} [pipelineStatus] - Last known pipeline execution status.
 * @property {number|null} [completedAt] - Completion timestamp (Unix ms).
 * @property {number}  createdAt      - Creation timestamp (Unix ms).
 * @property {number|null} [updatedAt] - Last-modified timestamp (Unix ms).
 */
export const Task = /** @type {Task} */ ({});

/**
 * Payload accepted by POST /api/tasks and PATCH /api/tasks/:id.
 *
 * All fields are optional on PATCH; `name` is strongly recommended on POST.
 *
 * @typedef {Object} TaskInput
 * @property {string}  [id]           - Explicit ID (auto-generated if omitted on create).
 * @property {string}  [name]         - Task name.
 * @property {string}  [title]        - Optional title.
 * @property {'pending'|'running'|'completed'|'failed'} [status]
 * @property {'low'|'medium'|'high'} [priority]
 * @property {string}  [category]
 * @property {string}  [timeLabel]
 * @property {number}  [dueAt]        - Unix ms.
 * @property {string}  [source]
 * @property {string}  [pipelineId]
 * @property {string}  [executionId]
 * @property {string}  [pipelineStatus]
 * @property {number}  [completedAt]
 * @property {number}  [createdAt]    - Overrides auto-generated value when supplied.
 * @property {number}  [updatedAt]
 */
export const TaskInput = /** @type {TaskInput} */ ({});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * A registered pipeline configuration entry.
 *
 * Stored in the `pipeline_configs` SQLite table.
 *
 * @typedef {Object} PipelineConfig
 * @property {number}      id           - Auto-increment primary key.
 * @property {string}      pipeline_id  - Unique pipeline identifier (business key).
 * @property {string|null} display_name - Human-readable label shown in the UI.
 * @property {string|null} api_base_url - Base URL of the external pipeline API.
 * @property {string}      created_at   - ISO-8601 datetime (SQLite default: datetime('now')).
 */
export const PipelineConfig = /** @type {PipelineConfig} */ ({});

/**
 * Payload for POST /api/pipeline-configs.
 *
 * @typedef {Object} PipelineConfigInput
 * @property {string}      pipeline_id  - Required. Must be unique.
 * @property {string}      [display_name]
 * @property {string}      [api_base_url]
 */
export const PipelineConfigInput = /** @type {PipelineConfigInput} */ ({});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pipeline usage statistics.
 *
 * Stored in the `pipeline_stats` SQLite table.  One row per pipeline_config.
 *
 * @typedef {Object} PipelineStat
 * @property {number}      id                  - Auto-increment primary key.
 * @property {string}      pipeline_id         - Foreign key → pipeline_configs.pipeline_id.
 * @property {number}      trigger_count       - Number of times this pipeline was triggered.
 * @property {string|null} last_triggered_at   - ISO-8601 datetime of most recent trigger.
 */
export const PipelineStat = /** @type {PipelineStat} */ ({});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Application-level key/value configuration entry.
 *
 * Stored in the `config` SQLite table (serialised as JSON strings).
 *
 * @typedef {Object} AppConfigEntry
 * @property {string} key   - Configuration key.
 * @property {string} value - JSON-serialised value.
 */
export const AppConfigEntry = /** @type {AppConfigEntry} */ ({});

/**
 * Hydrated application configuration object returned by GET /api/config.
 *
 * Sensitive fields (`aiApiKey`, `piosApiToken`) are omitted; presence is
 * indicated by boolean flags instead.
 *
 * @typedef {Object} AppConfig
 * @property {string}   [defaultPipelineId='']        - Default pipeline to trigger.
 * @property {Array}    [keywordRules=[]]              - Keyword-based routing rules.
 * @property {number}   [pollingInterval=5000]         - SSE poll interval (ms).
 * @property {number}   [analyzerWindowDays=7]         - Look-back window for the analyzer.
 * @property {number}   [analyzerFrequencyThreshold=5] - Minimum trigger count for analysis.
 * @property {number}   [analyzerThrottleMs=3600000]   - Minimum ms between analyzer runs.
 * @property {number}   [analyzerLastRunAt=0]           - Epoch ms of last analyzer run.
 * @property {string}   [aiApiBaseUrl='']              - External AI API base URL.
 * @property {string}   [aiModel='gpt-4o-mini']        - AI model identifier.
 * @property {string}   [piosApiBaseUrl='']            - πOS API base URL.
 * @property {boolean}  hasApiKey                      - Whether an AI API key is configured.
 * @property {boolean}  hasPiosToken                   - Whether a πOS token is configured.
 */
export const AppConfig = /** @type {AppConfig} */ ({});

/**
 * Patch payload for PATCH /api/config.
 *
 * Any subset of AppConfig fields may be supplied; sensitive keys are accepted
 * and stored but never returned in the response.
 *
 * @typedef {Object} AppConfigPatch
 * @property {string}  [defaultPipelineId]
 * @property {Array}   [keywordRules]
 * @property {number}  [pollingInterval]
 * @property {number}  [analyzerWindowDays]
 * @property {number}  [analyzerFrequencyThreshold]
 * @property {number}  [analyzerThrottleMs]
 * @property {string}  [aiApiBaseUrl]
 * @property {string}  [aiApiKey]        - Write-only; omitted from GET response.
 * @property {string}  [aiModel]
 * @property {string}  [piosApiBaseUrl]
 * @property {string}  [piosApiToken]    - Write-only; omitted from GET response.
 */
export const AppConfigPatch = /** @type {AppConfigPatch} */ ({});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * A pipeline recommendation card computed from pipeline_stats.
 *
 * Returned by GET /api/recommendations (at most 1 item in the array).
 *
 * @typedef {Object} PipelineRecommendation
 * @property {string} pipeline_id       - Pipeline identifier.
 * @property {string|null} display_name - Human-readable pipeline name.
 * @property {number} trigger_count     - Total number of triggers.
 * @property {string} last_triggered_at - ISO-8601 datetime of most recent trigger.
 */
export const PipelineRecommendation = /** @type {PipelineRecommendation} */ ({});

/**
 * User feedback on a recommendation card.
 *
 * Stored in the `recommendation_feedback` SQLite table.
 *
 * @typedef {Object} RecommendationFeedback
 * @property {number}  id          - Auto-increment primary key.
 * @property {string}  pipeline_id - Foreign key → pipeline_configs.pipeline_id.
 * @property {0|1}     useful      - 1 = helpful, 0 = not helpful.
 * @property {string}  created_at  - ISO-8601 datetime.
 */
export const RecommendationFeedback = /** @type {RecommendationFeedback} */ ({});

/**
 * Payload for POST /api/recommendations/feedback.
 *
 * @typedef {Object} RecommendationFeedbackInput
 * @property {string}  pipeline_id - Required.
 * @property {boolean} useful      - Required. true = helpful, false = not helpful.
 */
export const RecommendationFeedbackInput = /** @type {RecommendationFeedbackInput} */ ({});

// ─────────────────────────────────────────────────────────────────────────────

/**
 * A legacy recommendation record (recommendations table, separate from
 * pipeline-stats-based cards).
 *
 * @typedef {Object} LegacyRecommendation
 * @property {string}   id
 * @property {string|null} patternSignature
 * @property {string|null} suggestedPipelineName
 * @property {string[]} suggestedKeywords       - Parsed from JSON string in DB.
 * @property {string|null} reason
 * @property {'pending'|'accepted'|'dismissed'} status
 * @property {number|null} suppressUntil        - Unix ms; null if not suppressed.
 * @property {string|null} sourcePattern
 * @property {number}   createdAt               - Unix ms.
 * @property {number|null} updatedAt            - Unix ms.
 */
export const LegacyRecommendation = /** @type {LegacyRecommendation} */ ({});

/**
 * Patch payload for PATCH /api/config/recommendations/:id.
 *
 * @typedef {Object} RecommendationStatusPatch
 * @property {'accepted'|'dismissed'} status - Required.
 */
export const RecommendationStatusPatch = /** @type {RecommendationStatusPatch} */ ({});

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline trigger / execution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Payload for POST /api/pipelines/trigger.
 *
 * @typedef {Object} PipelineTriggerInput
 * @property {string} pipelineId - Required. The pipeline to trigger.
 */
export const PipelineTriggerInput = /** @type {PipelineTriggerInput} */ ({});

/**
 * Response from POST /api/pipelines/trigger.
 *
 * @typedef {Object} PipelineTriggerResult
 * @property {string} executionId - Identifier of the created pipeline execution.
 */
export const PipelineTriggerResult = /** @type {PipelineTriggerResult} */ ({});

/**
 * Payload for POST /api/pipelines (create a new pipeline via πOS).
 *
 * @typedef {Object} PipelineCreateInput
 * @property {string} name - Required. Human-readable pipeline name.
 */
export const PipelineCreateInput = /** @type {PipelineCreateInput} */ ({});

/**
 * Response from POST /api/pipelines.
 *
 * @typedef {Object} PipelineCreateResult
 * @property {string} pipelineId - Identifier assigned by πOS.
 */
export const PipelineCreateResult = /** @type {PipelineCreateResult} */ ({});

// ─────────────────────────────────────────────────────────────────────────────
// SSE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Server-Sent Event payload emitted by GET /api/pipeline/status-stream.
 *
 * Each `data:` line carries a JSON-serialised StatusStreamEvent.
 *
 * @typedef {Object} StatusStreamEvent
 * @property {Task[]} tasks       - Active tasks with status "pending" or "running".
 * @property {number} timestamp   - Server-side Unix ms when the event was emitted.
 * @property {string} [error]     - Present only when the server encountered an error.
 */
export const StatusStreamEvent = /** @type {StatusStreamEvent} */ ({});

// ─────────────────────────────────────────────────────────────────────────────
// Error envelope
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structured error detail object.
 *
 * @typedef {Object} ApiErrorDetail
 * @property {string} code    - Machine-readable error code (e.g. "NOT_FOUND", "CONFLICT").
 * @property {string} message - Human-readable description.
 */
export const ApiErrorDetail = /** @type {ApiErrorDetail} */ ({});

/**
 * Standard API error envelope returned for 4xx/5xx responses.
 *
 * @typedef {Object} ApiErrorEnvelope
 * @property {ApiErrorDetail} error - Error detail.
 */
export const ApiErrorEnvelope = /** @type {ApiErrorEnvelope} */ ({});

// ─────────────────────────────────────────────────────────────────────────────
// Generic response wrappers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple success acknowledgement (e.g. from POST /api/recommendations/feedback).
 *
 * @typedef {Object} OkResponse
 * @property {true} ok
 */
export const OkResponse = /** @type {OkResponse} */ ({});
