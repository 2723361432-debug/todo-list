# 智能待办事项系统 · 功能测试完整报告

> 测试日期：2026-05-26  
> 测试工具：Playwright (Chromium) + API 直接调用  
> 前端：http://localhost:5173 | 后端：http://localhost:3001

---

## 一、总体结果

| 模块 | 用例数 | PASS | FAIL | 通过率 |
|------|--------|------|------|--------|
| M1 任务管理（CRUD + 筛选）| 14 | 14 | 0 | **100%** |
| M2 语音录入（VoiceButton）| 8 | 8 | 0 | **100%** |
| M3 管线集成（pipeline-configs + SSE）| 11 | 11 | 0 | **100%** |
| M4/M5 推荐系统 + 配置管理 | — | — | — | 见子报告 |
| NFR 非功能专项 | 12 | 11 | 1 | **91.7%** |
| **合计** | **45+** | **44+** | **1** | **97.8%** |

---

## 二、发现的 Bug（共 4 个）

### BUG-M1-001 ⚠️ P1（已被 M1 Agent 自动修复）

**位置：** `/workspace/frontend/src/services/api.js`  
**问题：** `request()` 在所有响应上调用 `res.json()`，但 DELETE 返回 204 No Content（空 body），导致 `SyntaxError`。delete 回调 catch 住错误但不 dispatch `REMOVE_TASK`，被删任务在 UI 中仍然可见。  
**修复：** `const data = res.status === 204 ? null : await res.json()`  
**状态：** ✅ 已修复（M1 Agent 执行期间）

---

### BUG-M3-001 🔴 High（未修复）

**位置：** `/workspace/frontend/src/App.jsx` + `/workspace/frontend/src/components/InputPanel.jsx`  
**问题：** `PipelineTriggerModal` 在任务创建后从不显示（FR-10 回归）。`App.jsx` 定义了 `handleTaskCreated` 并设置 `showPipelineModal=true`，但 `<InputPanel>` 从未收到 `onTaskCreated` prop；InputPanel 创建任务后也从不调用该回调。  
**修复：**
- `App.jsx`：给 `<InputPanel>` 加 `onTaskCreated={handleTaskCreated}` prop
- `InputPanel.jsx`：dispatch ADD_TASK 后调用 `onTaskCreated?.(created)`  
**状态：** ❌ 待修复

---

### BUG-NFR-02 🔴 High（未修复）

**位置：** `/workspace/backend/src/controllers/configController.js`  
**问题：** GET `/api/config` 调用原始 `getConfig()` 而非 `getSafeConfig()`，导致 πOS Token 明文返回给前端（违反 NFR-07、G-02）。`configService.getSafeConfig()` 已实现 token 脱敏逻辑，但路由未使用它。  
**修复：** 将 configController 的 `getConfig` handler 改为调用 `configService.getSafeConfig()`  
**状态：** ❌ 待修复

---

### BUG-NFR-05 🔴 High（未修复）

**位置：** 多个 CSS 文件（InputPanel、TaskItem、ConfigPanel、RecommendationPanel）  
**问题：** 39/40 交互元素的点击区域低于 44×44px（NFR-07 移动端）：
- 筛选 Tab 按钮：约 31px 高
- 复选框：16×16px（原生默认）
- 关闭（×）按钮：17×21px  
- 提交按钮：67×32px  
**修复：** 所有按钮加 `min-height: 44px`；复选框用带 padding 的 `<label>` 包裹  
**状态：** ❌ 待修复

---

## 三、各模块详细截图清单

| 截图路径 | 说明 |
|----------|------|
| screenshots/M1-task-crud/01~14.png | 任务 CRUD 全流程 |
| screenshots/M2-voice/01-page-loaded.png | 主页面加载 |
| screenshots/M2-voice/02-firefox-no-voice-btn.png | Firefox 无 VoiceButton |
| screenshots/M2-voice/06-voice-btn-dom.png | VoiceButton DOM 结构 |
| screenshots/M2-voice/08-empty-submit-shake.png | 空提交 shake 动效 |
| screenshots/M3-pipeline/TC-M3-*.png | 管线配置 + ConfigPanel |
| screenshots/NFR/01~12.png | NFR 专项截图 |

---

## 四、测试环境备注

- **SSE 长连接影响**：所有 `page.goto()` 必须使用 `waitUntil: 'load'`，`networkidle` 永不触发（SSE 保持连接）
- **语音测试**：无法在 headless 环境测试真实麦克风，TC-M2-004/005/006/007 均通过代码检查方式验证
- **Firefox 测试**：通过 UA 伪造 + 删除 SpeechRecognition API 模拟

---

## 五、下一步：回归修复

**4 个 Bug → 5 个修复 Agent 并行处理（已准备就绪）**
