# L2-003 · Pipeline Trigger & SSE Status Push（后端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**backend** · 复杂度：**L** （≈150 min）

## 任务目标

实现管线触发 POST /api/pipelines/:id/trigger + SSE 状态推送 GET /api/pipeline/status-stream；集成 piosClient（Bearer Token 代理）；SSE 连接池（heartbeat 30s + data push 5s），满足 NFR-01 P95 <=60s。

## 前置依赖（必须已完成才能开工）

- `L1-001` — SQLite Schema & db.js 初始化器（产出：contract.sqlite-schema, backend/db.js, backend/migrations/init.sql）
- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.sqlite-schema` （由 L1-001 产出，类型 schema）
- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/routes/pipelines.js`
- `backend/routes/sseStream.js`
- `backend/controllers/pipelineController.js`
- `backend/services/piosClient.js`
- `backend/services/sseService.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `backend/routes/pipelines.js`
- `backend/routes/sseStream.js`
- `backend/controllers/pipelineController.js`
- `backend/services/piosClient.js`
- `backend/services/sseService.js`

## 验收标准（完成定义）

- [ ] POST /api/pipelines/:id/trigger body:{pipelineId} → 200 + {executionId}；PIOS_API_BASE_URL未配置→503
- [ ] piosClient.js: Bearer Token从.env注入请求头；5xx重试2次+1s退避；401不重试
- [ ] 触发成功后写入pipeline_stats（trigger_count+1，last_triggered_at=NOW）
- [ ] GET /api/pipeline/status-stream: 响应头Content-Type:text/event-stream + Cache-Control:no-cache + Connection:keep-alive
- [ ] 数据推送计时器：每5s轮询πOS状态，状态变更→立即推送SSE帧
- [ ] 心跳计时器：连续30s无数据帧→发送':heartbeat\n\n'
- [ ] 客户端断开→clearInterval清理两个计时器，调用res.end()
- [ ] πOS状态别名映射：completed/success→completed，failed/error→failed，running→running
- [ ] PIOS_API_BASE_URL未配置时，SSE连接保持但不发任何事件（静默模式）

## 上下文引用（来自规格文档）

- SRS：SRS FR-10/13/14/16
- TRS：TRS §4.3 BP-02 SSE推送, TRS §6.3.8-6.3.9

## 为什么这个任务在 L2

πOS代理+SSE推送，仅依赖db.js和api契约，无L2间依赖

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
