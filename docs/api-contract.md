# Smart Todo System — API Contract

**Version:** V1.0  
**Base URL:** `http://localhost:3001`  
**Content-Type:** `application/json` (except the SSE endpoint)

---

## Table of Contents

1. [Tasks](#1-tasks)
   - [GET /api/tasks](#11-get-apitasks)
   - [POST /api/tasks](#12-post-apitasks)
   - [PATCH /api/tasks/:id](#13-patch-apitasksid)
   - [DELETE /api/tasks/:id](#14-delete-apitasksid)
2. [Pipeline Configs](#2-pipeline-configs)
   - [GET /api/pipeline-configs](#21-get-apipipeline-configs)
   - [POST /api/pipeline-configs](#22-post-apipipeline-configs)
   - [DELETE /api/pipeline-configs/:id](#23-delete-apipipeline-configsid)
3. [Pipelines](#3-pipelines)
   - [POST /api/pipelines/trigger](#31-post-apipipelinestrigger)
   - [GET /api/pipeline/status-stream (SSE)](#32-get-apipipelinestatus-stream-sse)
4. [Recommendations](#4-recommendations)
   - [GET /api/recommendations](#41-get-apirecommendations)
   - [POST /api/recommendations/feedback](#42-post-apirecommendationsfeedback)
5. [Config](#5-config)
   - [GET /api/config](#51-get-apiconfig)
   - [PATCH /api/config](#52-patch-apiconfig)

---

## 1. Tasks

### 1.1 GET /api/tasks

Retrieve all tasks, ordered by creation time descending.

**Request**

| Parameter | Location | Type | Required | Description |
|-----------|----------|------|----------|-------------|
| —         | —        | —    | —        | No parameters |

**Response — 200 OK**

Returns a JSON array of Task objects.

```json
[
  {
    "id": "task_1716700000000_a1b2c3d4",
    "name": "Deploy release v2.0",
    "title": null,
    "status": "pending",
    "priority": "high",
    "category": "devops",
    "timeLabel": "today",
    "dueAt": 1716800000000,
    "source": "manual",
    "pipelineId": "pipeline_abc",
    "executionId": null,
    "pipelineStatus": null,
    "completedAt": null,
    "createdAt": 1716700000000,
    "updatedAt": null
  }
]
```

**Task object fields**

| Field          | Type            | Nullable | Description |
|----------------|-----------------|----------|-------------|
| id             | string          | No       | Unique task identifier |
| name           | string          | No       | Primary task description |
| title          | string          | Yes      | Optional secondary title |
| status         | string (enum)   | No       | `pending` \| `running` \| `completed` \| `failed` |
| priority       | string (enum)   | Yes      | `low` \| `medium` \| `high` (default: `medium`) |
| category       | string          | Yes      | User-defined category |
| timeLabel      | string          | Yes      | Human-readable time bucket |
| dueAt          | number (Unix ms)| Yes      | Due timestamp |
| source         | string          | Yes      | Origin of task (e.g. `manual`, `pipeline`) |
| pipelineId     | string          | Yes      | Associated pipeline identifier |
| executionId    | string          | Yes      | Pipeline execution identifier |
| pipelineStatus | string          | Yes      | Last known pipeline execution status |
| completedAt    | number (Unix ms)| Yes      | Completion timestamp |
| createdAt      | number (Unix ms)| No       | Creation timestamp |
| updatedAt      | number (Unix ms)| Yes      | Last-modification timestamp |

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 1.2 POST /api/tasks

Create a new task.

**Request body**

| Field          | Type            | Required | Default | Description |
|----------------|-----------------|----------|---------|-------------|
| name           | string          | No*      | `""`    | Task description (* strongly recommended) |
| id             | string          | No       | auto    | Override auto-generated ID |
| status         | string (enum)   | No       | `pending` | Initial status |
| priority       | string (enum)   | No       | `medium` | `low` \| `medium` \| `high` |
| category       | string          | No       | null    | Category label |
| timeLabel      | string          | No       | null    | Time bucket label |
| dueAt          | number (Unix ms)| No       | null    | Due timestamp |
| source         | string          | No       | null    | Task origin |
| pipelineId     | string          | No       | null    | Associated pipeline |
| executionId    | string          | No       | null    | Execution ID |
| pipelineStatus | string          | No       | null    | Pipeline status |
| completedAt    | number (Unix ms)| No       | null    | Completion timestamp |
| createdAt      | number (Unix ms)| No       | now     | Override creation timestamp |

```json
{
  "name": "Review pull request #42",
  "priority": "high",
  "category": "code-review",
  "timeLabel": "today"
}
```

**Response — 201 Created**

Returns the newly created Task object (same schema as GET /api/tasks array item).

```json
{
  "id": "task_1716700001234_b5c6d7e8",
  "name": "Review pull request #42",
  "status": "pending",
  "priority": "high",
  "category": "code-review",
  "timeLabel": "today",
  "dueAt": null,
  "source": null,
  "pipelineId": null,
  "executionId": null,
  "pipelineStatus": null,
  "completedAt": null,
  "createdAt": 1716700001234,
  "updatedAt": null
}
```

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 1.3 PATCH /api/tasks/:id

Partially update an existing task. Only supplied fields are modified; `id` and `createdAt` are immutable.

**Path parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | Task identifier |

**Request body**

Any subset of the mutable Task fields:

| Field          | Type            | Description |
|----------------|-----------------|-------------|
| name           | string          | Updated task description |
| title          | string          | Updated title |
| status         | string (enum)   | `pending` \| `running` \| `completed` \| `failed` |
| priority       | string (enum)   | `low` \| `medium` \| `high` |
| category       | string          | Category label |
| timeLabel      | string          | Time bucket label |
| dueAt          | number (Unix ms)| Due timestamp |
| source         | string          | Task origin |
| pipelineId     | string          | Associated pipeline |
| executionId    | string          | Execution ID |
| pipelineStatus | string          | Pipeline status |
| completedAt    | number (Unix ms)| Completion timestamp |

```json
{
  "status": "completed",
  "completedAt": 1716800000000
}
```

**Response — 200 OK**

Returns the updated Task object.

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 404         | `NOT_FOUND` | No task exists with the given id |
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 1.4 DELETE /api/tasks/:id

Permanently delete a task.

**Path parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | Task identifier |

**Response — 204 No Content**

Empty body on success.

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 404         | `NOT_FOUND` | No task exists with the given id |
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

## 2. Pipeline Configs

### 2.1 GET /api/pipeline-configs

List all registered pipeline configurations, ordered by creation time descending.

**Request**

No parameters.

**Response — 200 OK**

```json
[
  {
    "id": 1,
    "pipeline_id": "pipeline_deploy_prod",
    "display_name": "Deploy to Production",
    "api_base_url": "https://pios.example.com",
    "created_at": "2025-05-26 10:00:00"
  }
]
```

**PipelineConfig object fields**

| Field        | Type    | Nullable | Description |
|--------------|---------|----------|-------------|
| id           | number  | No       | Auto-increment primary key |
| pipeline_id  | string  | No       | Unique business identifier |
| display_name | string  | Yes      | Human-readable label |
| api_base_url | string  | Yes      | External pipeline API base URL |
| created_at   | string  | No       | ISO-8601 datetime (UTC) |

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 2.2 POST /api/pipeline-configs

Register a new pipeline configuration. Also creates a corresponding entry in `pipeline_stats` (trigger_count initialised to 0).

**Request body**

| Field        | Type   | Required | Description |
|--------------|--------|----------|-------------|
| pipeline_id  | string | **Yes**  | Unique pipeline identifier. Must not already exist. |
| display_name | string | No       | Human-readable label |
| api_base_url | string | No       | External pipeline API base URL |

```json
{
  "pipeline_id": "pipeline_deploy_staging",
  "display_name": "Deploy to Staging",
  "api_base_url": "https://pios.example.com"
}
```

**Response — 201 Created**

Returns the newly created PipelineConfig object.

```json
{
  "id": 2,
  "pipeline_id": "pipeline_deploy_staging",
  "display_name": "Deploy to Staging",
  "api_base_url": "https://pios.example.com",
  "created_at": "2025-05-26 10:05:00"
}
```

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 400         | `INVALID_INPUT` | `pipeline_id` is missing |
| 409         | `CONFLICT` | A config with this `pipeline_id` already exists |
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 2.3 DELETE /api/pipeline-configs/:id

Delete a pipeline configuration by its `pipeline_id` value (not the integer `id`).

**Path parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | string | Yes      | The `pipeline_id` value (business key, e.g. `pipeline_deploy_prod`) |

**Response — 204 No Content**

Empty body on success.

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 404         | `NOT_FOUND` | No config with the given `pipeline_id` |
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

## 3. Pipelines

### 3.1 POST /api/pipelines/trigger

Trigger a registered pipeline via the πOS API. Also increments the pipeline's `trigger_count` in `pipeline_stats`.

**Request body**

| Field      | Type   | Required | Description |
|------------|--------|----------|-------------|
| pipelineId | string | **Yes**  | Identifier of the pipeline to trigger |

```json
{
  "pipelineId": "pipeline_deploy_prod"
}
```

**Response — 200 OK**

```json
{
  "executionId": "exec_1716700000000_xyz"
}
```

| Field       | Type   | Description |
|-------------|--------|-------------|
| executionId | string | Identifier of the created pipeline execution |

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 400         | `INVALID_INPUT` | `pipelineId` is missing |
| 500         | `INTERNAL_ERROR` | πOS API call failed or unexpected error |

---

### 3.2 GET /api/pipeline/status-stream (SSE)

Server-Sent Events stream. The server polls active tasks every **5 seconds** and pushes updates to all connected clients. An initial event is emitted immediately upon connection.

**Request**

No parameters. Set the `Accept: text/event-stream` header (or rely on the browser `EventSource` API).

**Response headers**

| Header             | Value |
|--------------------|-------|
| Content-Type       | `text/event-stream` |
| Cache-Control      | `no-cache` |
| Connection         | `keep-alive` |
| X-Accel-Buffering  | `no` |

**Event stream format**

Each event is a `data:` line followed by a blank line:

```
data: {"tasks":[...],"timestamp":1716700000000}

data: {"tasks":[...],"timestamp":1716700005000}
```

**StatusStreamEvent payload fields**

| Field     | Type          | Description |
|-----------|---------------|-------------|
| tasks     | Task[]        | All tasks with `status` of `pending` or `running` |
| timestamp | number (Unix ms) | Server-side time when event was emitted |
| error     | string        | Present only on server-side error; `tasks` will be absent |

**Error event example**

```
data: {"error":"Database read failed","timestamp":1716700010000}
```

**Connection lifecycle**

The stream remains open until the client disconnects. No reconnection logic is implemented server-side; clients should use the browser `EventSource` API's built-in reconnection.

---

## 4. Recommendations

### 4.1 GET /api/recommendations

Return at most one pipeline recommendation card computed from `pipeline_stats`.

A pipeline is recommended when all of the following hold:
- `trigger_count >= 3`
- `last_triggered_at` is within the last 7 days
- No `useful = 0` (suppression) feedback was submitted within the last 7 days
- No `useful = 1` feedback was submitted within the last 24 hours

**Request**

No parameters.

**Response — 200 OK**

An array of 0 or 1 PipelineRecommendation objects.

```json
[
  {
    "pipeline_id": "pipeline_deploy_prod",
    "display_name": "Deploy to Production",
    "trigger_count": 7,
    "last_triggered_at": "2025-05-25 14:30:00"
  }
]
```

| Field            | Type   | Nullable | Description |
|------------------|--------|----------|-------------|
| pipeline_id      | string | No       | Pipeline identifier |
| display_name     | string | Yes      | Human-readable pipeline name |
| trigger_count    | number | No       | Total trigger count |
| last_triggered_at| string | No       | ISO-8601 datetime of most recent trigger |

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 4.2 POST /api/recommendations/feedback

Record user feedback for a recommendation card. Feedback controls future suppression:
- `useful: false` suppresses the pipeline from recommendations for 7 days.
- `useful: true` prevents it from appearing again for 24 hours.

**Request body**

| Field       | Type    | Required | Description |
|-------------|---------|----------|-------------|
| pipeline_id | string  | **Yes**  | The pipeline being rated |
| useful      | boolean | **Yes**  | `true` = helpful, `false` = not helpful |

```json
{
  "pipeline_id": "pipeline_deploy_prod",
  "useful": false
}
```

**Response — 201 Created**

```json
{
  "ok": true
}
```

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 400         | `INVALID_INPUT` | `pipeline_id` is missing or empty |
| 400         | `INVALID_INPUT` | `useful` field is missing |
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

## 5. Config

### 5.1 GET /api/config

Retrieve the current application configuration. Sensitive fields (`aiApiKey`, `piosApiToken`) are never returned; their presence is indicated by boolean flags.

**Request**

No parameters.

**Response — 200 OK**

```json
{
  "defaultPipelineId": "",
  "keywordRules": [],
  "pollingInterval": 5000,
  "analyzerWindowDays": 7,
  "analyzerFrequencyThreshold": 5,
  "analyzerThrottleMs": 3600000,
  "analyzerLastRunAt": 0,
  "aiApiBaseUrl": "https://api.openai.com/v1",
  "aiModel": "gpt-4o-mini",
  "piosApiBaseUrl": "https://pios.example.com",
  "hasApiKey": true,
  "hasPiosToken": false
}
```

**AppConfig response fields**

| Field                      | Type    | Description |
|----------------------------|---------|-------------|
| defaultPipelineId          | string  | Default pipeline triggered automatically |
| keywordRules               | array   | Keyword-based task routing rules |
| pollingInterval            | number  | SSE server poll interval (ms) |
| analyzerWindowDays         | number  | Look-back window for frequency analysis (days) |
| analyzerFrequencyThreshold | number  | Minimum trigger count to surface a recommendation |
| analyzerThrottleMs         | number  | Minimum interval between analyzer runs (ms) |
| analyzerLastRunAt          | number  | Unix ms timestamp of last analyzer run |
| aiApiBaseUrl               | string  | External AI API base URL |
| aiModel                    | string  | AI model identifier (default: `gpt-4o-mini`) |
| piosApiBaseUrl             | string  | πOS API base URL |
| hasApiKey                  | boolean | `true` if an AI API key is stored |
| hasPiosToken               | boolean | `true` if a πOS API token is stored |

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

### 5.2 PATCH /api/config

Update one or more configuration values. Returns the updated safe config (same schema as GET /api/config).

**Request body**

Any subset of the following writable fields:

| Field                      | Type   | Description |
|----------------------------|--------|-------------|
| defaultPipelineId          | string | Default pipeline ID |
| keywordRules               | array  | Keyword routing rules |
| pollingInterval            | number | SSE poll interval (ms) |
| analyzerWindowDays         | number | Analyzer look-back window (days) |
| analyzerFrequencyThreshold | number | Minimum trigger count for recommendations |
| analyzerThrottleMs         | number | Minimum ms between analyzer runs |
| aiApiBaseUrl               | string | External AI API base URL |
| aiApiKey                   | string | AI API key (write-only; never returned) |
| aiModel                    | string | AI model identifier |
| piosApiBaseUrl             | string | πOS API base URL |
| piosApiToken               | string | πOS API token (write-only; never returned) |

```json
{
  "defaultPipelineId": "pipeline_deploy_prod",
  "aiModel": "gpt-4o",
  "aiApiKey": "sk-..."
}
```

**Response — 200 OK**

Returns the updated AppConfig (same schema as GET /api/config; sensitive keys excluded).

**Error responses**

| HTTP Status | code | Description |
|-------------|------|-------------|
| 500         | `INTERNAL_ERROR` | Unexpected server error |

---

## Error Envelope

All 4xx and 5xx responses share a common JSON envelope:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Task not found: task_abc123"
  }
}
```

| Field         | Type   | Description |
|---------------|--------|-------------|
| error.code    | string | Machine-readable error code |
| error.message | string | Human-readable description |

**Known error codes**

| code           | Typical HTTP status | Description |
|----------------|---------------------|-------------|
| `INVALID_INPUT`| 400                 | Missing or malformed request field |
| `INVALID_STATUS` | 400               | Enum value not in allowed set |
| `NOT_FOUND`    | 404                 | Resource does not exist |
| `CONFLICT`     | 409                 | Duplicate unique resource |
| `INTERNAL_ERROR` | 500               | Unhandled server exception |
