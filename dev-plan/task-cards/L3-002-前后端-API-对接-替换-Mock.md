# L3-002 · 前后端 API 对接（替换 Mock）

> 项目：**智能待办事项系统** · 层级：**L3** · 角色：**fullstack** · 复杂度：**M** （≈120 min）

## 任务目标

将前端 api.js 的 mock base URL 切换为真实后端，补全 AppContext reducer 处理器与真实 API 响应格式的对接；联调主页面全链路（添加/完成/删除/筛选任务），验证第一期 DoD D-01~D-12。

## 前置依赖（必须已完成才能开工）

- `L3-001` — 后端服务集成测试（产出：backend/tests/integration/tasks.test.js, backend/tests/integration/pipelines.test.js, backend/tests/integration/recommendations.test.js）
- `L2-006` — TaskListPanel + TaskItem（前端 UI）（产出：frontend/src/components/TaskListPanel.jsx, frontend/src/components/TaskListPanel.module.css, frontend/src/components/TaskItem.jsx, frontend/src/components/TaskItem.module.css）
- `L2-007` — InputPanel + VoiceButton + PipelineTrigger Modal（前端）（产出：frontend/src/components/InputPanel.jsx, frontend/src/components/InputPanel.module.css, frontend/src/components/VoiceButton.jsx, frontend/src/components/VoiceButton.module.css, frontend/src/components/PipelineTriggerModal.jsx, frontend/src/components/PipelineTriggerModal.module.css, frontend/src/hooks/useSpeechRecognition.js）
- `L2-008` — usePipelineSSE Hook（前端）（产出：frontend/src/hooks/usePipelineSSE.js）
- `L2-009` — ConfigPanel（前端）（产出：frontend/src/components/ConfigPanel.jsx, frontend/src/components/ConfigPanel.module.css）
- `L2-010` — RecommendationPanel（前端）（产出：frontend/src/components/RecommendationPanel.jsx, frontend/src/components/RecommendationPanel.module.css）
- `L2-011` — App Shell & 全局 UX（前端）（产出：frontend/src/App.jsx, frontend/src/App.module.css, frontend/src/components/Toast.jsx, frontend/src/components/Toast.module.css, frontend/src/components/ErrorBanner.jsx, frontend/src/components/ErrorBanner.module.css, frontend/src/index.css）

## 你将消费的契约（L1 产物）

- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- _未指定_

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/utils/api.js（更新）`
- `frontend/src/context/AppContext.jsx（更新）`

## 验收标准（完成定义）

- [ ] api.js所有fetch函数BASE_URL切换为真实后端（从.env.local读取VITE_API_URL）
- [ ] AppContext reducer完整实现所有action处理器（INIT_TASKS/ADD_TASK/UPDATE_TASK/DELETE_TASK/SET_PIPELINE_CONFIGS/UPDATE_TASK_PIPELINE_STATUS等）
- [ ] 浏览器访问前端：任务列表从后端SQLite加载；CRUD操作持久化（刷新后数据保留）
- [ ] SRS DoD D-01~D-12 第一期验收项全部手工验证通过
- [ ] usePipelineSSE连接真实后端SSE端点（有πOS配置时收到状态推送）

## 上下文引用（来自规格文档）

- SRS：SRS §9.1 第一期验收
- PRD：PRD §5.5 第一期DoD

## 为什么这个任务在 L3

真实接口替换mock，前后端在此层联调验证，是关键路径串行节点

---

## 工作规范

1. **契约不可动**：你消费的 L1 契约已被冻结。如果发现契约错误或缺失，**停止编码**，先在任务输出中报告问题
2. **文件边界严守**：只写 "你拥有的文件" 清单里的路径，其他路径只读不写
3. **mock 先行**：若你的实现依赖尚未完成的下游服务，使用 L1 提供的 mock；不要因为依赖未到位就阻塞自己
4. **测试随码**：每个 L2 任务都应包含单元测试，与实现一起交付（除非任务卡明确不要求）
5. **完成回报**：完成后简要汇报：
   - 实际产出的文件清单
   - 验收标准逐项 ✅/❌
   - 与契约的偏差（如有）
   - 留给下游 Agent 的注意事项
