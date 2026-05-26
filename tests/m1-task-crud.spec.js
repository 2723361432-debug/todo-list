import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS = '/workspace/test-results/screenshots/M1-task-crud';

/**
 * Add a task by typing in the textarea and pressing Enter.
 * Returns the 0-based index of the task in the list (most recently added = top or bottom).
 */
async function addTask(page, name) {
  const textarea = page.locator('textarea[placeholder*="输入待办"]');
  await textarea.click();
  await textarea.fill(name);
  await textarea.press('Enter');
  // Wait for the task to appear
  await page.waitForFunction(
    (taskName) => {
      const items = document.querySelectorAll('li');
      return Array.from(items).some(li => li.textContent.includes(taskName));
    },
    name,
    { timeout: 5000 }
  );
}

/**
 * Find the index of a task item in the list by name.
 * Returns -1 if not found.
 */
async function findTaskIndex(page, name) {
  const items = page.locator('li');
  const count = await items.count();
  for (let i = 0; i < count; i++) {
    const text = await items.nth(i).textContent();
    if (text.includes(name)) return i;
  }
  return -1;
}

/**
 * Get task item locator by name (for stable tasks not being edited).
 * IMPORTANT: After dblclick, the item loses its text content (text moves to input value),
 * so use findTaskIndex + nth(index) for edit operations.
 */
function taskItemByName(page, name) {
  return page.locator('li').filter({ hasText: name }).first();
}

test.describe('M1 任务管理 CRUD + 过滤', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('textarea[placeholder*="输入待办"]', { timeout: 10000 });
    // Reset filter to "全部"
    const allBtn = page.locator('button').filter({ hasText: /^全部/ });
    if (await allBtn.count() > 0) {
      await allBtn.first().click();
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-001: Empty text submit blocked
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-001: 空文本提交拦截', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="输入待办"]');
    const submitBtn = page.locator('button', { hasText: '提交' });

    // Ensure textarea is empty
    await textarea.fill('');

    // Submit button must be disabled when input is empty
    await expect(submitBtn).toBeDisabled();

    // Count items before
    const beforeCount = await page.locator('li').count();

    // Press Enter with empty input — shake animation fires but no task added
    await textarea.click();
    await textarea.press('Enter');
    await page.waitForTimeout(400); // shake duration

    // No new tasks
    const afterCount = await page.locator('li').count();
    expect(afterCount).toBe(beforeCount);

    // Input still empty
    await expect(textarea).toHaveValue('');

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-001-empty-submit-blocked.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-002: Add task success
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-002: 添加任务成功', async ({ page }) => {
    const ts = Date.now();
    const taskName = `测试任务001_${ts}`;
    const textarea = page.locator('textarea[placeholder*="输入待办"]');
    const submitBtn = page.locator('button', { hasText: '提交' });

    await textarea.fill(taskName);
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();

    // Task appears in list
    await expect(page.locator('li').filter({ hasText: taskName }).first()).toBeVisible({ timeout: 5000 });

    // Input cleared
    await expect(textarea).toHaveValue('');

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-002-add-task-success.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-003: Delete — no confirmation dialog
  // NOTE: App has no cancel/confirm flow; handleDelete fires immediately.
  // This test verifies the delete button is present (FR-03 N/A for cancel).
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-003: 删除按钮存在（无确认对话框）', async ({ page }) => {
    const ts = Date.now();
    const taskName = `待删除任务_${ts}`;
    await addTask(page, taskName);

    const item = taskItemByName(page, taskName);
    await expect(item).toBeVisible();

    // Delete button present
    const deleteBtn = item.locator('button[aria-label="删除"]');
    await expect(deleteBtn).toBeVisible();

    // NOTE: No confirm/cancel dialog exists — TC-M1-003 (cancel keeps task) is NOT APPLICABLE.
    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-003-delete-btn-visible.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-004: Delete task — clicking delete button
  // BUG: api.js calls res.json() on DELETE 204 response → SyntaxError thrown
  //      → dispatch(REMOVE_TASK) never executes → UI not updated.
  //      Task IS deleted from backend but remains in UI.
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-004: 点击删除按钮移除任务（BUG：UI不更新）', async ({ page }) => {
    const ts = Date.now();
    const taskName = `确认删除_${ts}`;
    await addTask(page, taskName);

    const item = taskItemByName(page, taskName);
    await expect(item).toBeVisible();

    const deleteBtn = item.locator('button[aria-label="删除"]');
    await deleteBtn.hover();
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-004-delete-attempt.png` });

    // Expected: task gone from UI. Actual: UI still shows task due to bug.
    await expect(page.locator('li').filter({ hasText: taskName })).toHaveCount(0, { timeout: 3000 });

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-004-delete-confirmed.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-005: Complete task toggle
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-005: 完成任务切换', async ({ page }) => {
    const ts = Date.now();
    const taskName = `完成切换_${ts}`;
    await addTask(page, taskName);

    const item = taskItemByName(page, taskName);
    const checkbox = item.locator('input[type="checkbox"]');

    await expect(checkbox).not.toBeChecked();
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 5000 });

    // The outer div should get "done" in its class name (CSS module: _done_14wdj_xx)
    const itemDiv = item.locator('div').first();
    await expect(itemDiv).toHaveClass(/done/, { timeout: 5000 });

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-005-complete-toggle.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-006: Complete task persists after refresh
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-006: 完成状态刷新后保持', async ({ page }) => {
    const ts = Date.now();
    const taskName = `持久化完成_${ts}`;
    await addTask(page, taskName);

    const item = taskItemByName(page, taskName);
    const checkbox = item.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked({ timeout: 5000 });

    await page.reload();
    await page.waitForSelector('textarea[placeholder*="输入待办"]', { timeout: 10000 });

    const itemAfterReload = taskItemByName(page, taskName);
    await expect(itemAfterReload).toBeVisible({ timeout: 5000 });
    const checkboxAfterReload = itemAfterReload.locator('input[type="checkbox"]');
    await expect(checkboxAfterReload).toBeChecked();

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-006-persist-after-refresh.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-007: Inline edit — double click to edit
  // NOTE: After dblclick, text moves to <input value="...">, so the li's
  //       textContent no longer contains the task name. Must use index-based
  //       locator instead of filter({ hasText }).
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-007: 双击标题进入编辑模式', async ({ page }) => {
    const ts = Date.now();
    const taskName = `编辑前文本_${ts}`;
    await addTask(page, taskName);

    // Get item index BEFORE dblclick
    const idx = await findTaskIndex(page, taskName);
    expect(idx).toBeGreaterThanOrEqual(0);

    const targetItem = page.locator('li').nth(idx);
    const nameSpan = targetItem.locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    // Edit input (not checkbox) should appear inside the item
    const editInput = page.locator('li').nth(idx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 3000 });
    await expect(editInput).toHaveValue(taskName);

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-007-dblclick-edit.png` });

    // Cancel to restore state
    await editInput.press('Escape');
    await page.waitForTimeout(200);
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-008: Inline edit — Enter saves new text
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-008: 编辑后按 Enter 保存', async ({ page }) => {
    const ts = Date.now();
    const origName = `编辑前文本_${ts}`;
    const newName = `编辑后文本_${ts}`;
    await addTask(page, origName);

    const idx = await findTaskIndex(page, origName);
    expect(idx).toBeGreaterThanOrEqual(0);

    const targetItem = page.locator('li').nth(idx);
    const nameSpan = targetItem.locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = page.locator('li').nth(idx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 3000 });

    await editInput.fill(newName);
    await editInput.press('Enter');
    await page.waitForTimeout(500);

    // New text visible, old text gone
    await expect(page.locator('li').filter({ hasText: newName }).first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('li').filter({ hasText: origName })).toHaveCount(0, { timeout: 3000 });

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-008-edit-enter-save.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-009: Inline edit — Esc cancels
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-009: 编辑按 Esc 取消', async ({ page }) => {
    const ts = Date.now();
    const origName = `原始文本_${ts}`;
    await addTask(page, origName);

    const idx = await findTaskIndex(page, origName);
    expect(idx).toBeGreaterThanOrEqual(0);

    const targetItem = page.locator('li').nth(idx);
    const nameSpan = targetItem.locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = page.locator('li').nth(idx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 3000 });

    await editInput.fill('不保存');
    await editInput.press('Escape');
    await page.waitForTimeout(200);

    // Original text should be back
    await expect(page.locator('li').filter({ hasText: origName }).first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('li').filter({ hasText: '不保存' })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-009-edit-esc-cancel.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-010: Inline edit — empty text blur reverts to original
  // Logic in commitEdit: if (!trimmed) return without updating → setEditing(false) → original text shown
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-010: 编辑清空后失焦回滚原文本', async ({ page }) => {
    const ts = Date.now();
    const origName = `不可清空_${ts}`;
    await addTask(page, origName);

    const idx = await findTaskIndex(page, origName);
    expect(idx).toBeGreaterThanOrEqual(0);

    const targetItem = page.locator('li').nth(idx);
    const nameSpan = targetItem.locator('span[title="双击编辑"]');
    await nameSpan.dblclick();
    await page.waitForTimeout(200);

    const editInput = page.locator('li').nth(idx).locator('input:not([type="checkbox"])');
    await expect(editInput).toBeVisible({ timeout: 3000 });

    // Clear all text, then blur (click elsewhere)
    await editInput.fill('');
    await page.locator('textarea[placeholder*="输入待办"]').click();
    await page.waitForTimeout(300);

    // Original text should revert
    await expect(page.locator('li').filter({ hasText: origName }).first()).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-010-edit-empty-revert.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-011: Filter "待办" shows only pending tasks
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-011: 过滤"待办"只显示未完成任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = `待办任务A_${ts}`;
    const pending2 = `待办任务B_${ts}`;
    const done1 = `已完成任务_${ts}`;

    await addTask(page, pending1);
    await addTask(page, pending2);
    await addTask(page, done1);

    // Complete done1
    const doneItem = taskItemByName(page, done1);
    await doneItem.locator('input[type="checkbox"]').click();
    await expect(doneItem.locator('input[type="checkbox"]')).toBeChecked({ timeout: 5000 });

    // Click "待办" filter
    await page.locator('button').filter({ hasText: /^待办/ }).click();

    // Pending tasks visible
    await expect(page.locator('li').filter({ hasText: pending1 }).first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('li').filter({ hasText: pending2 }).first()).toBeVisible({ timeout: 3000 });
    // Completed task hidden
    await expect(page.locator('li').filter({ hasText: done1 })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-011-filter-pending.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-012: Filter "已完成" shows only completed tasks
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-012: 过滤"已完成"只显示已完成任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = `过滤待办_${ts}`;
    const done1 = `过滤完成_${ts}`;

    await addTask(page, pending1);
    await addTask(page, done1);

    // Complete done1
    const doneItem = taskItemByName(page, done1);
    await doneItem.locator('input[type="checkbox"]').click();
    await expect(doneItem.locator('input[type="checkbox"]')).toBeChecked({ timeout: 5000 });

    // Click "已完成" filter
    await page.locator('button').filter({ hasText: /^已完成/ }).click();

    // Completed visible
    await expect(page.locator('li').filter({ hasText: done1 }).first()).toBeVisible({ timeout: 3000 });
    // Pending hidden
    await expect(page.locator('li').filter({ hasText: pending1 })).toHaveCount(0);

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-012-filter-done.png` });
  });

  // ─────────────────────────────────────────────────────────────────
  // TC-M1-013: Filter "全部" shows all tasks
  // ─────────────────────────────────────────────────────────────────
  test('TC-M1-013: 过滤"全部"显示所有任务', async ({ page }) => {
    const ts = Date.now();
    const pending1 = `全部待办_${ts}`;
    const done1 = `全部完成_${ts}`;

    await addTask(page, pending1);
    await addTask(page, done1);

    // Complete done1
    const doneItem = taskItemByName(page, done1);
    await doneItem.locator('input[type="checkbox"]').click();
    await expect(doneItem.locator('input[type="checkbox"]')).toBeChecked({ timeout: 5000 });

    // Switch to "已完成" to confirm pending is hidden
    await page.locator('button').filter({ hasText: /^已完成/ }).click();
    await expect(page.locator('li').filter({ hasText: pending1 })).toHaveCount(0);

    // Switch to "全部"
    await page.locator('button').filter({ hasText: /^全部/ }).click();

    // Both visible
    await expect(page.locator('li').filter({ hasText: pending1 }).first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator('li').filter({ hasText: done1 }).first()).toBeVisible({ timeout: 3000 });

    await page.screenshot({ path: `${SCREENSHOTS}/TC-M1-013-filter-all.png` });
  });
});
