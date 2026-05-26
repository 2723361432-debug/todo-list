# L1-003 · Mock API Server

> 项目：**智能待办事项系统** · 层级：**L1** · 角色：**backend** · 复杂度：**M** （≈90 min）

## 任务目标

启动 Express mock 服务器（port 3001），为全部 13 个端点返回 stub 数据（含 SSE 模拟），让 6 个前端 L2 任务在真实后端完成前可完全独立运行。

## 前置依赖（必须已完成才能开工）

- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/mock-server.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `contract.mock-api`
- `backend/mock-server.js`

## 验收标准（完成定义）

- [ ] node backend/mock-server.js 在3001端口启动
- [ ] 覆盖全部13个端点，返回符合contract.api-types的stub数据
- [ ] GET /api/tasks 返回至少3条示例任务（含pending/completed混合）
- [ ] GET /api/pipeline-configs 返回至少2条示例管线配置
- [ ] GET /api/pipeline/status-stream 返回SSE连接，每5s推送一次heartbeat
- [ ] GET /api/recommendations 返回至少1条示例推荐
- [ ] 所有POST/PATCH/DELETE端点返回对应成功状态码和stub响应体
- [ ] 前端L2任务可直接对接此Mock Server完成完整UI开发

## 上下文引用（来自规格文档）

- TRS：TRS §6.3 核心接口契约
- OTHER：contract.api-types

## 为什么这个任务在 L1

Mock Server使所有前端L2任务完全独立于后端实现，是最大化L2并行度的关键

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
