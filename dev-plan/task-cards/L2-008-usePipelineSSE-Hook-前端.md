# L2-008 · usePipelineSSE Hook（前端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**M** （≈90 min）

## 任务目标

实现 usePipelineSSE hook：EventSource 订阅 /api/pipeline/status-stream，指数退避断线重连，将 pipeline 状态变更（completed/failed）dispatch 到 AppContext，满足 NFR-01 P95 <=60s。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/hooks/usePipelineSSE.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/hooks/usePipelineSSE.js`

## 验收标准（完成定义）

- [ ] 组件挂载时创建new EventSource('/api/pipeline/status-stream')
- [ ] onmessage解析data字段（JSON），dispatch UPDATE_TASK_PIPELINE_STATUS {taskId, pipelineStatus, updatedAt}
- [ ] 接收heartbeat帧时不dispatch（仅心跳维持连接，不更新状态）
- [ ] onerror：指数退避重连（1s/2s/4s，最大30s），console.warn记录重连次数
- [ ] 组件卸载时eventSource.close()（无内存泄漏）
- [ ] AppContext reducer接收UPDATE_TASK_PIPELINE_STATUS时，比较payload.updatedAt与store中现有updatedAt：payload较旧则丢弃（防乱序覆盖）
- [ ] PIOS未配置时SSE保持连接但无事件，Hook静默等待（不显示错误）

## 上下文引用（来自规格文档）

- SRS：SRS NFR-01
- TRS：TRS §5.2 DL-03 SSE链路, TRS §4.3.2 SSE异常分支

## 为什么这个任务在 L2

纯Hook，无UI渲染，依赖mock-server的SSE端点和AppContext dispatch，完全独立

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
