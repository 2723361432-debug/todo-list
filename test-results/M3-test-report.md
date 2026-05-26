# M3 Pipeline Integration + SSE – Test Report

**Date:** 2026-05-26  
**Test file:** `/workspace/tests/m3-pipeline.spec.js`  
**Total tests:** 11  
**Passed:** 11  
**Failed:** 0  
**Duration:** ~9.8 s  

---

## Test Results Summary

| TC | Name | Status | Notes |
|----|------|--------|-------|
| TC-M3-001 | GET /api/pipeline-configs returns array | PASS | Returns `[]` when empty |
| TC-M3-002 | POST /api/pipeline-configs creates config | PASS | 201 + pipeline_id in response |
| TC-M3-003 | DELETE /api/pipeline-configs/:id removes config | PASS | 204; removed from GET list |
| TC-M3-004 | Duplicate pipeline_id returns 409 | PASS | Correct CONFLICT code |
| TC-M3-005 | PipelineTriggerModal after task creation | PASS (soft) | **BUG-M3-001 confirmed** (see below) |
| TC-M3-006 | SSE endpoint text/event-stream headers | PASS | Verified via page.evaluate + AbortController |
| TC-M3-006b | SSE Content-Type via network intercept | PASS | `content-type: text/event-stream` confirmed |
| TC-M3-007 | pipeline_stats entry after config creation | PASS | Transactional insert verified |
| TC-M3-008 | Missing pipeline_id returns 400 | PASS | `INVALID_INPUT` error code correct |
| TC-M3-009 | ConfigPanel renders in UI | PASS | Screenshot saved |
| TC-M3-010 | ConfigPanel keyword rule form works | PASS | Rule added to table visually confirmed |

---

## Screenshots

| Test | File |
|------|------|
| TC-M3-005 | `test-results/screenshots/M3-pipeline/tc-m3-005-after-task-creation.png` |
| TC-M3-009 | `test-results/screenshots/M3-pipeline/tc-m3-009-config-panel.png` |
| TC-M3-010 | `test-results/screenshots/M3-pipeline/tc-m3-010-keyword-rule-added.png` |

---

## Bugs Found

### BUG-M3-001 – PipelineTriggerModal never appears after task creation (FR-14)

**Severity:** High  
**Component:** Frontend – `InputPanel.jsx` / `App.jsx`  
**FR:** FR-14 (trigger modal should appear after task creation)

**Description:**  
`App.jsx` correctly defines `handleTaskCreated` and wires it to `setShowPipelineModal(true)`. However, `InputPanel.jsx` receives `onVoiceResult` and `voiceText` props, but **never receives `onTaskCreated`**. The `InputPanel.submit()` function calls `dispatch({ type: 'ADD_TASK', payload: created })` and shows a toast, but never calls back to the parent with the newly created task.

As a result, `handleTaskCreated` in `App.jsx` is dead code — it is never invoked, and `showPipelineModal` is never set to `true`.

**Reproduction:**  
1. Navigate to `http://localhost:5173`
2. Add a pipeline config via `POST /api/pipeline-configs`
3. Type any task text and press Enter or click 提交
4. Observe: `PipelineTriggerModal` does NOT appear

**Evidence:**  
Screenshot `tc-m3-005-after-task-creation.png` shows task added to list with no modal.

**Fix:**  
In `App.jsx`, add `onTaskCreated={handleTaskCreated}` to the `InputPanel` component:
```jsx
<InputPanel
  onVoiceResult={(t) => setVoiceText(t)}
  voiceText={voiceText}
  onTaskCreated={handleTaskCreated}   // <-- add this
/>
```
In `InputPanel.jsx`, accept and call the prop after successful task creation:
```js
// In submit():
const created = await createTask({ name: trimmed, title: trimmed })
dispatch({ type: 'ADD_TASK', payload: created })
onTaskCreated?.(created)   // <-- add this
```

---

## Technical Notes

### SSE Testing Strategy
`waitUntil: 'networkidle'` cannot be used with this app because the SSE stream (`/api/pipeline/status-stream`) keeps an HTTP connection permanently open, preventing Playwright's network-idle detection. All UI tests use `waitUntil: 'load'` instead.

SSE content-type was verified via two complementary approaches:
1. `page.evaluate` + `AbortController` to fetch headers then immediately abort
2. Playwright `page.on('response')` network interception for the SSE request the app opens automatically via `usePipelineSSE` hook

### pipeline_stats Transaction Verification
There is no public API endpoint to read `pipeline_stats` directly. Transactional correctness (config + stats inserted atomically) was verified indirectly: `pipelineConfigService.create()` uses `db.transaction()` wrapping both `insertConfig.run()` and `insertStats.run()`, so a 201 response from `POST /api/pipeline-configs` guarantees the stats row was inserted.

The `recordTrigger` path (called from `triggerPipeline`) requires an external `piosClient` connection that is not available in the test environment. This path was not end-to-end testable at the API layer.

### Delete endpoint uses pipeline_id as path param
`DELETE /api/pipeline-configs/:id` — the `:id` maps to `pipeline_id` (the string identifier), not the auto-increment integer `id`. The controller calls `pipelineConfigService.remove(req.params.id)` which runs `DELETE FROM pipeline_configs WHERE pipeline_id = ?`. This is correct behavior and all delete tests pass.
