# L2-002 · Pipeline Config Service & Routes（后端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**backend** · 复杂度：**S** （≈60 min）

## 任务目标

实现管线配置 CRUD：GET/POST /api/pipeline-configs + DELETE /api/pipeline-configs/:id，操作 pipeline_configs 表；每次触发后向 pipeline_stats UPSERT 统计（trigger_count + last_triggered_at）。

## 前置依赖（必须已完成才能开工）

- `L1-001` — SQLite Schema & db.js 初始化器（产出：contract.sqlite-schema, backend/db.js, backend/migrations/init.sql）
- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.sqlite-schema` （由 L1-001 产出，类型 schema）
- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/routes/pipeline-configs.js`
- `backend/controllers/pipelineConfigController.js`
- `backend/services/pipelineConfigService.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `backend/routes/pipeline-configs.js`
- `backend/controllers/pipelineConfigController.js`
- `backend/services/pipelineConfigService.js`

## 验收标准（完成定义）

- [ ] GET /api/pipeline-configs → 200 + PipelineConfig[]
- [ ] POST /api/pipeline-configs body:{pipeline_id(required),display_name,api_base_url} → 201 + PipelineConfig；pipeline_id重复→409
- [ ] DELETE /api/pipeline-configs/:id → 204；不存在→404
- [ ] pipeline_id字段UNIQUE约束在SQLite层强制（不依赖应用层去重）
- [ ] curl测试：3个端点均正常

## 上下文引用（来自规格文档）

- SRS：SRS FR-11, SRS修订版图8 pipeline_configs表
- TRS：TRS §6.3 接口设计

## 为什么这个任务在 L2

管线配置CRUD，纯SQLite操作，与其他服务零依赖

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
