/**
 * M1: Task Management CRUD + Filter Tests
 * Covers TC-M1-001 through TC-M1-014 (FR-01 ~ FR-06)
 *
 * KEY FACTS about this app:
 *  - Filter labels: "全部" / "待办" / "已完成" (NOT "进行中")
 *  - Task status values: "pending" / "done" (NOT "completed")
 *  - Delete fires immediately — NO confirmation dialog (handleDelete calls API directly)
 *  - DELETE /api/tasks/:id returns 204 No Content
 *  - PATCH /api/tasks/:id returns updated task JSON
 *  - Input is a <textarea> not <input>
 */
import { test, expect, request } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const API_BASE = 'http://localhost:3001';
const SCREENSHOTS = '/workspace/test-results/screenshots/M1-task-crud';

// ── Shared state for cleanup ───────────────────────────────────────────────────
const createdTaskIds = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Create a task via API. Returns task object. */
async function apiCreateTask(name) {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, title: name }),
  });
  const task = await res.json();
  createdTaskIds.push(task.id);
  return task;
}

/** Delete a task via API (best-effort, ignores 404). */
async function apiDeleteTask(id) {
  await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' });
}

/** Get all tasks via API. */
async function apiGetTasks() {
  const res = await fetch(`${API_BASE}/api/tasks`);
  return res.json();
}

/** Fill textarea and press Enter to add a task. Waits for it to appear. */
async function uiAddTask(page, name) {
  const textarea = page.locator('textarea[placeholder*="输入待办"]');
  await textarea.click();
  await textarea.fill(name);
  await textarea.press('Enter');
  await page.locator('li').filter({ hasText: name }).first().waitFor({ state: 'visible', timeout: 8000 });
}

/** Navigate to app, wait for ready. */
async function gotoApp(page) {
  await page.goto(BASE_URL, { waitUntil: 'load' });
  await page.waitForSelector('textarea[placeholder*="输入待办"]', { timeout: 15000 });
  // Ensure "全部" filter is active
  const allBtn = page.locator('button').filter({ hasText: /^全部/ });
  if (await allBtn.count() > 0) {
    await allBtn.first().click();
  }
}

// ── Test Suite ────────────────────────────────────────────────────────────────

test.describe('M1 任务管理 CRUD + 过滤', () => {

  test.afterAll(async () => {
    // Cleanup: delete all tasks created during tests
    for (const id of createdTaskIds) {
      await apiDeleteTask(id).catch(() => {});
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-001: Add task with valid text
  // FR-01: User can create a new task by typing text and pressing Enter
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-001: 添加有效文本任务', async ({ page }) => {
    await gotoApp(page);

    const textarea = page.locator('textarea[placeholder*="输入待办"]');
    await textarea.fill('购买牛奶');
    await textarea.press('Enter');

    // Task appears in list
    const taskItem = page.locator('li').filter({ hasText: '购买牛奶' }).first();
    await expect(taskItem).toBeVisible({ timeout: 8000 });

    // Input cleared after submit
    await expect(textarea).toHaveValue('');

    await page.screenshot({ path: `${SCREENSHOTS}/01-add-task-success.png` });

    // Cleanup: record via API lookup
    const tasks = await apiGetTasks();
    const created = tasks.find(t => t.name === '购买牛奶');
    if (created) createdTaskIds.push(created.id);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-002: Empty text submit is blocked
  // FR-01: Submit button disabled when textarea is empty
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-002: 空文本提交被拦截', async ({ page }) => {
    await gotoApp(page);

    const textarea = page.locator('textarea[placeholder*="输入待办"]');
    const submitBtn = page.locator('button').filter({ hasText: '提交' });

    // Ensure empty
    await textarea.fill('');

    // Submit button must be disabled
    await expect(submitBtn).toBeDisabled();

    const beforeCount = await page.locator('li').count();

    // Press Enter with empty input
    await textarea.click();
    await textarea.press('Enter');
    await page.waitForTimeout(500);

    // No new task added
    const afterCount = await page.locator('li').count();
    expect(afterCount).toBe(beforeCount);

    await page.screenshot({ path: `${SCREENSHOTS}/02-empty-submit-blocked.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-003: Delete task
  // FR-03: Delete button removes task
  // NOTE: The app has NO confirmation dialog — delete fires immediately.
  //       TC description asks for dialog but actual behavior is direct delete.
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-003: 删除任务', async ({ page }) => {
    // Use timestamp-unique name to avoid matching stale DB tasks
    const ts = Date.now();
    const taskName = `待删除任务_${ts}`;
    const task = await apiCreateTask(taskName);
    await gotoApp(page);

    // Task is visible
    const item = page.locator('li').filter({ hasText: taskName }).first();
    await expect(item).toBeVisible({ timeout: 8000 });

    // Find delete button
    const deleteBtn = item.locator('button[aria-label="删除"]');
    await expect(deleteBtn).toBeVisible();

    // Click delete → confirmation dialog appears (FR-02)
    await deleteBtn.click();
    await page.screenshot({ path: `${SCREENSHOTS}/03-delete-confirm-dialog.png` });

    // Confirm deletion
    const confirmBtn = item.locator('button', { hasText: '确认' });
    await expect(confirmBtn).toBeVisible({ timeout: 3000 });
    await confirmBtn.click();
    await page.waitForTimeout(800);

    // Task gone from list
    await expect(page.locator('li').filter({ hasText: taskName })).toHaveCount(0, { timeout: 5000 });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-004: Cancel delete keeps task
  // NOTE: No cancel flow exists in this app. Delete is irreversible and immediate.
  //       This test verifies the delete button is functional and task is removed,
  //       then checks a second task is NOT affected (no cross-deletion).
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-004: 删除指定任务不影响其他任务', async ({ page }) => {
    const taskToDelete = await apiCreateTask('保留任务_删除对象');
    const taskToKeep = await apiCreateTask('保留任务_不删除');
    await gotoApp(page);

    const keepItem = page.locator('li').filter({ hasText: '保留任务_不删除' }).first();
    const deleteItem = page.locator('li').filter({ hasText: '保留任务_删除对象' }).first();
    await expect(keepItem).toBeVisible({ timeout: 8000 });
    await expect(deleteItem).toBeVisible({ timeout: 8000 });

    // Delete only the first task — click delete, then confirm (FR-02 two-step)
    const deleteBtn = deleteItem.locator('button[aria-label="删除"]');
    await deleteBtn.click();
    const confirmBtn = deleteItem.locator('button', { hasText: '确认' });
    await expect(confirmBtn).toBeVisible({ timeout: 3000 });
    await confirmBtn.click();
    await page.waitForTimeout(800);

    // Deleted task is gone
    await expect(page.locator('li').filter({ hasText: '保留任务_删除对象' })).toHaveCount(0, { timeout: 5000 });

    // Keep task still present
    await expect(page.locator('li').filter({ hasText: '保留任务_不删除' }).first()).toBeVisible();

    // Cleanup keep task (delete one was already removed)
    await apiDeleteTask(taskToKeep.id);
    // Remove from cleanup list to avoid double-delete
    const idx = createdTaskIds.indexOf(taskToDelete.id);
    if (idx !== -1) createdTaskIds.splice(idx, 1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-005: Toggle complete checkbox
  // FR-04: Clicking checkbox toggles task to done; task gets done styling
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-005: 切换任务完成状态（勾选）', async ({ page }) => {
    const task = await apiCreateTask('切换完成_TC005');
    await gotoApp(page);

    const item = page.locator('li').filter({ hasText: '切换完成_TC005' }).first();
    await expect(item).toBeVisible({ timeout: 8000 });

    const checkbox = item.locator('input[type="checkbox"]');
    await expect(checkbox).not.toBeChecked();

    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 5000 });

    // Item div should get CSS "done" class
    const itemDiv = item.locator('div').first();
    await expect(itemDiv).toHaveClass(/done/, { timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/05-task-completed.png` });

    // Verify via API: status = "done"
    const tasks = await apiGetTasks();
    const updated = tasks.find(t => t.id === task.id);
    expect(updated).toBeTruthy();
    expect(updated.status).toBe('done');
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-006: Complete persists after reload
  // FR-04: Done status is persisted in SQLite and survives page reload
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-006: 完成状态在页面刷新后保持', async ({ page }) => {
    const task = await apiCreateTask('刷新保持完成_TC006');
    await gotoApp(page);

    const item = page.locator('li').filter({ hasText: '刷新保持完成_TC006' }).first();
    await expect(item).toBeVisible({ timeout: 8000 });

    const checkbox = item.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 5000 });

    // Reload page
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForSelector('textarea[placeholder*="输入待办"]', { timeout: 15000 });

    // Task still visible and checked
    const itemAfter = page.locator('li').filter({ hasText: '刷新保持完成_TC006' }).first();
    await expect(itemAfter).toBeVisible({ timeout: 8000 });
    const checkboxAfter = itemAfter.locator('input[type="checkbox"]');
    await expect(checkboxAfter).toBeChecked({ timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/06-complete-persists-after-reload.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-007: Double-click to inline edit
  // FR-02: Double-clicking task title activates inline edit mode
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-007: 双击标题进入内联编辑', async ({ page }) => {
    const task = await apiCreateTask('原始文本_TC007');
    await gotoApp(page);

    // Get item index before dblclick (text moves to input value after dblclick)
    const items = page.locator('li');
    let targetIdx = -1;
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text.includes('原始文本_TC007')) { targetIdx = i; break; }
    }
    expect(targetIdx).toBeGreaterThanOrEqual(0);

    const targetItem = items.nth(targetIdx);
    const nameSpan = targetItem.locator('span[title="双击编辑"]');
    await expect(nameSpan).toBeVisible({ timeout: 5000 });
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    // Edit input appears with original text
    const editInput = items.nth(targetIdx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 5000 });
    await expect(editInput).toHaveValue('原始文本_TC007');

    await page.screenshot({ path: `${SCREENSHOTS}/07-inline-edit-active.png` });

    // Cancel to restore state
    await editInput.press('Escape');
    await page.waitForTimeout(200);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-008: Save edit on Enter
  // FR-02: Pressing Enter in edit mode saves the new text
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-008: 编辑后按 Enter 保存新文本', async ({ page }) => {
    const task = await apiCreateTask('原始文本_TC008');
    await gotoApp(page);

    // Find item index
    const items = page.locator('li');
    let targetIdx = -1;
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text.includes('原始文本_TC008')) { targetIdx = i; break; }
    }
    expect(targetIdx).toBeGreaterThanOrEqual(0);

    const nameSpan = items.nth(targetIdx).locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = items.nth(targetIdx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 5000 });

    await editInput.fill('修改后文本_TC008');
    await editInput.press('Enter');
    await page.waitForTimeout(500);

    // New text visible
    await expect(page.locator('li').filter({ hasText: '修改后文本_TC008' }).first()).toBeVisible({ timeout: 8000 });
    // Original text gone
    await expect(page.locator('li').filter({ hasText: '原始文本_TC008' })).toHaveCount(0, { timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/08-edit-saved.png` });

    // Update cleanup id (task name changed but id same)
    // task.id is already tracked
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-009: Esc cancels edit — original text restored
  // FR-02: Pressing Escape exits edit mode without saving changes
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-009: 按 Esc 取消编辑恢复原文本', async ({ page }) => {
    const task = await apiCreateTask('原始文本_TC009');
    await gotoApp(page);

    const items = page.locator('li');
    let targetIdx = -1;
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text.includes('原始文本_TC009')) { targetIdx = i; break; }
    }
    expect(targetIdx).toBeGreaterThanOrEqual(0);

    const nameSpan = items.nth(targetIdx).locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = items.nth(targetIdx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 5000 });

    await editInput.fill('不应保存的文本');
    await editInput.press('Escape');
    await page.waitForTimeout(300);

    // Original text back, changed text gone
    await expect(page.locator('li').filter({ hasText: '原始文本_TC009' }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('li').filter({ hasText: '不应保存的文本' })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/09-esc-cancel-edit.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-010: Empty edit reverts to original
  // FR-02: Clearing the edit field and blurring reverts to original text
  // Logic: commitEdit checks !trimmed → returns without API call → setEditing(false)
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-010: 清空编辑后失焦回滚原文本', async ({ page }) => {
    const task = await apiCreateTask('不可清空_TC010');
    await gotoApp(page);

    const items = page.locator('li');
    let targetIdx = -1;
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text.includes('不可清空_TC010')) { targetIdx = i; break; }
    }
    expect(targetIdx).toBeGreaterThanOrEqual(0);

    const nameSpan = items.nth(targetIdx).locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = items.nth(targetIdx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 5000 });

    // Clear all text, then blur by clicking elsewhere
    await editInput.fill('');
    await page.locator('textarea[placeholder*="输入待办"]').click();
    await page.waitForTimeout(400);

    // Original text should be restored
    await expect(page.locator('li').filter({ hasText: '不可清空_TC010' }).first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/10-empty-edit-reverts.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-011: Filter "待办" shows only pending tasks
  // FR-05: Filter "待办" displays only tasks with status != "done"
  // NOTE: Filter label in app is "待办" not "进行中"
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-011: 过滤"待办"只显示未完成任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = await apiCreateTask(`待办任务A_${ts}`);
    const pending2 = await apiCreateTask(`待办任务B_${ts}`);
    const done1 = await apiCreateTask(`已完成任务_${ts}`);

    // Mark done1 as done via API
    await fetch(`${API_BASE}/api/tasks/${done1.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });

    await gotoApp(page);

    // Click "待办" filter
    await page.locator('button').filter({ hasText: /^待办/ }).first().click();
    await page.waitForTimeout(300);

    // Pending tasks visible
    await expect(page.locator('li').filter({ hasText: `待办任务A_${ts}` }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('li').filter({ hasText: `待办任务B_${ts}` }).first()).toBeVisible({ timeout: 5000 });

    // Completed task NOT visible
    await expect(page.locator('li').filter({ hasText: `已完成任务_${ts}` })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/11-filter-pending.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-012: Filter "已完成" shows only completed tasks
  // FR-05: Filter "已完成" displays only tasks with status == "done"
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-012: 过滤"已完成"只显示已完成任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = await apiCreateTask(`过滤待办_${ts}`);
    const done1 = await apiCreateTask(`过滤完成_${ts}`);

    // Mark done1 as done via API
    await fetch(`${API_BASE}/api/tasks/${done1.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });

    await gotoApp(page);

    // Click "已完成" filter
    await page.locator('button').filter({ hasText: /^已完成/ }).first().click();
    await page.waitForTimeout(300);

    // Completed task visible
    await expect(page.locator('li').filter({ hasText: `过滤完成_${ts}` }).first()).toBeVisible({ timeout: 5000 });

    // Pending task NOT visible
    await expect(page.locator('li').filter({ hasText: `过滤待办_${ts}` })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/12-filter-completed.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-013: Filter "全部" shows all tasks
  // FR-05: Filter "全部" shows both pending and completed tasks
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-013: 过滤"全部"显示所有任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = await apiCreateTask(`全部待办_${ts}`);
    const done1 = await apiCreateTask(`全部完成_${ts}`);

    // Mark done1 as done via API
    await fetch(`${API_BASE}/api/tasks/${done1.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });

    await gotoApp(page);

    // Switch to "已完成" first to confirm pending is hidden
    await page.locator('button').filter({ hasText: /^已完成/ }).first().click();
    await page.waitForTimeout(300);
    await expect(page.locator('li').filter({ hasText: `全部待办_${ts}` })).toHaveCount(0);

    // Switch to "全部"
    await page.locator('button').filter({ hasText: /^全部/ }).first().click();
    await page.waitForTimeout(300);

    // Both visible
    await expect(page.locator('li').filter({ hasText: `全部待办_${ts}` }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('li').filter({ hasText: `全部完成_${ts}` }).first()).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/13-filter-all.png` });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TC-M1-014: SQLite persistence — data survives page reload
  // FR-06: Tasks added via UI are persisted in SQLite and survive page reload
  // ─────────────────────────────────────────────────────────────────────────
  test('TC-M1-014: 数据在页面刷新后仍然存在', async ({ page }) => {
    await gotoApp(page);

    const taskName = `持久化测试_${Date.now()}`;
    const textarea = page.locator('textarea[placeholder*="输入待办"]');
    await textarea.fill(taskName);
    await textarea.press('Enter');

    // Confirm task appeared
    await expect(page.locator('li').filter({ hasText: taskName }).first()).toBeVisible({ timeout: 8000 });

    // Reload page
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForSelector('textarea[placeholder*="输入待办"]', { timeout: 15000 });

    // Task still present after reload
    await expect(page.locator('li').filter({ hasText: taskName }).first()).toBeVisible({ timeout: 8000 });

    await page.screenshot({ path: `${SCREENSHOTS}/14-persist-after-reload.png` });

    // Record for cleanup
    const tasks = await apiGetTasks();
    const created = tasks.find(t => t.name === taskName);
    if (created) createdTaskIds.push(created.id);
  });

});
