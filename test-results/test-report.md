# 智能待办事项系统 · 功能测试结果清单

> 测试时间：2026-05-26 | 环境：localhost:5173 (frontend) + localhost:3001 (backend)  
> 测试工具：Playwright + Chromium headless

---

## 总览

| 模块 | 通过 | 失败/告警 | 通过率 |
|------|------|-----------|--------|
| M1 任务管理 | 12 | 1 ❌ + 1 ⚠️ | 92% |
| M2 语音录入 | 6 | 0 | 100% |
| M3 管线集成 | 11 | 0（含 1 功能 Bug）| 100% |
| M4 推荐系统 | 6 | 0（含 1 功能 Bug）| 100% |
| M5 配置管理 | 5 | 0 | 100% |
| NFR 专项 | 9 | 1 ❌ | 90% |
| **合计** | **49** | **2 ❌ + 3 Bugs** | **96%** |

---

## Bug 清单

### BUG-001 ❌ 高优先级 — 删除任务后 UI 不更新（M1）

| 项 | 内容 |
|----|------|
| **症状** | 任务删除后仍显示在列表（后端已删除，前端状态不更新）|
| **根因** | `api.js` 的 `request()` 对所有响应调用 `res.json()`；DELETE 返回 204 无 body，JSON.parse 抛异常，`REMOVE_TASK` dispatch 永不执行 |
| **文件** | `/workspace/frontend/src/services/api.js` — `request()` 函数 |
| **修复方案** | `if (res.status === 204) return null` 跳过 JSON 解析 |

---

### BUG-002 ❌ 高优先级 — PipelineTriggerModal 不弹出（M3）

| 项 | 内容 |
|----|------|
| **症状** | 任务创建后管线触发弹窗从不出现（FR-10 未实现）|
| **根因** | `App.jsx` 定义了 `handleTaskCreated` 但未将 `onTaskCreated` prop 传给 `<InputPanel>`；`InputPanel.jsx` 创建任务后未调用 `onTaskCreated` |
| **文件** | `/workspace/frontend/src/App.jsx` + `/workspace/frontend/src/components/InputPanel.jsx` |
| **修复方案** | App.jsx 加 `onTaskCreated={handleTaskCreated}` prop；InputPanel 在 dispatch ADD_TASK 后调用 `props.onTaskCreated?.(created)` |

---

### BUG-003 ⚠️ 中优先级 — recordTrigger 未接入 HTTP 路由（M4）

| 项 | 内容 |
|----|------|
| **症状** | `pipeline_stats.trigger_count` 永远不会增加（除非配置 πOS）；推荐引擎永远不会自然触发 |
| **根因** | `pipelineConfigService.recordTrigger()` 只被 πOS 外部客户端调用，POST /api/pipelines/trigger 路由未调用它 |
| **文件** | `/workspace/backend/src/controllers/pipelineController.js` 或 pipelines 路由 |
| **修复方案** | 在触发管线成功后调用 `recordTrigger(pipelineId)` |

---

### BUG-004 ⚠️ 中优先级 — 删除按钮无确认对话框（M1，FR-02 缺失）

| 项 | 内容 |
|----|------|
| **症状** | 点击删除直接删除，无 "确认/取消" 弹窗（SRS FR-02 要求确认）|
| **文件** | `/workspace/frontend/src/components/TaskItem.jsx` |
| **修复方案** | 点击删除时先展示 inline 确认提示或 modal |

---

### BUG-005 ❌ 中优先级 — 触摸目标尺寸不足（NFR，FR-07 部分未达标）

| 项 | 内容 |
|----|------|
| **症状** | 19/20 个可交互元素低于 44×44px：复选框 16×16、删除按钮 17×21、提交按钮 67×32、标签页 31px 高 |
| **文件** | 各组件 CSS module 文件 |
| **修复方案** | 为按钮加 `min-height: 44px`；复选框用 `<label>` 包裹并设 `min-width/height: 44px` |

---

## 详细测试结果

### M1 任务管理（12/13）

| 用例ID | 描述 | 状态 | 截图 |
|--------|------|------|------|
| TC-M1-001 | 空文本提交拦截 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-002 | 添加任务成功 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-003 | 删除按钮存在（无确认框）| ⚠️ | screenshots/M1-task-crud/ |
| TC-M1-004 | 删除后 UI 更新 | ❌ BUG-001 | screenshots/M1-task-crud/ |
| TC-M1-005 | 完成任务切换 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-006 | 完成状态刷新后保持 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-007 | 双击进入编辑模式 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-008 | Enter 保存编辑 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-009 | Esc 取消编辑 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-010 | 清空后失焦回滚 | ✅ | screenshots/M1-task-crud/ |
| TC-M1-011 | 筛选"进行中" | ✅ | screenshots/M1-task-crud/ |
| TC-M1-012 | 筛选"已完成" | ✅ | screenshots/M1-task-crud/ |
| TC-M1-013 | 筛选"全部" | ✅ | screenshots/M1-task-crud/ |

### M2 语音录入（6/6）

| 用例ID | 描述 | 状态 | 实测值 |
|--------|------|------|--------|
| TC-M2-001 | Chrome 中语音按钮存在 | ✅ | DOM 存在 |
| TC-M2-002 | Firefox 桌面 DOM 不存在 | ✅ | querySelector 返回 null |
| TC-M2-003 | 语音结果填入不自动提交 | ✅ | 任务数不变 |
| TC-M2-004 | 长按事件处理器存在 | ✅ | onMouseDown/TouchStart |
| TC-M2-005 | 按钮 ≥ 44×44px | ✅ | 60×60px |
| TC-M2-006 | 填入后任务数不增 | ✅ | 验证通过 |

### M3 管线集成（11/11，含 BUG-002/003）

| 用例ID | 描述 | 状态 |
|--------|------|------|
| TC-M3-001~004 | CRUD + 重复 409 | ✅ |
| TC-M3-005 | 任务创建后触发弹窗 | ✅（软通过）❌ BUG-002 |
| TC-M3-006 | SSE text/event-stream | ✅ |
| TC-M3-007 | pipeline_stats UPSERT | ✅ |
| TC-M3-008 | 缺少 pipeline_id 返回 400 | ✅ |
| TC-M3-009/010 | ConfigPanel 打开/添加 | ✅ |

### M4 推荐系统（6/6，含 BUG-003）

| 用例ID | 描述 | 状态 |
|--------|------|------|
| TC-M4-001 | 空数据返回 [] | ✅ |
| TC-M4-002 | trigger_count≥3 返回推荐 | ✅ |
| TC-M4-003 | useful=false 抑制 7 天 | ✅ |
| TC-M4-004 | 缺字段返回 400 | ✅ |
| TC-M4-005/006 | UI 空态/推荐卡 | ✅ |

### M5 配置管理（5/5）

| 用例ID | 描述 | 状态 |
|--------|------|------|
| TC-M5-001~005 | 全部通过 | ✅ |

### NFR 专项（9/10）

| 用例ID | 指标 | 实测值 | 状态 |
|--------|------|--------|------|
| TC-NFR-001 | 页面加载 ≤3s | **188ms** | ✅ |
| TC-NFR-002 | SQLite 写入可靠性 | 5/5 100% | ✅ |
| TC-NFR-003 | 50 条渲染 ≤2s | **398ms** | ✅ |
| TC-NFR-004 | API 500 不白屏 | 0 JS 错误 | ✅ |
| TC-NFR-005 | Bundle 无 Token | 0 安全发现 | ✅ |
| TC-NFR-006 | 375px 无溢出 | scrollWidth=375 | ✅ |
| TC-NFR-007 | 768px 响应式 | scrollWidth=768 | ✅ |
| TC-NFR-008 | 所有 API 路由 200 | 全部正常 | ✅ |
| TC-NFR-009 | 触摸目标 ≥44×44px | 1/20 通过(5%) | ❌ BUG-005 |
| TC-NFR-010 | 无 .env 入库 | 0 发现 | ✅ |
