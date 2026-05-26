# L2-004 · Recommendation Service & Routes（后端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**backend** · 复杂度：**M** （≈120 min）

## 任务目标

实现推荐服务：GET /api/recommendations（SQL 7 天内 trigger_count>=3，含 24h 冷却 + 7 天抑制期过滤）+ POST /api/recommendations/feedback（写 recommendation_feedback，计算 suppressUntil），满足 NFR-02 100% 精度。

## 前置依赖（必须已完成才能开工）

- `L1-001` — SQLite Schema & db.js 初始化器（产出：contract.sqlite-schema, backend/db.js, backend/migrations/init.sql）
- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.sqlite-schema` （由 L1-001 产出，类型 schema）
- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/routes/recommendations.js`
- `backend/controllers/recommendationController.js`
- `backend/services/recommendationService.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `backend/routes/recommendations.js`
- `backend/controllers/recommendationController.js`
- `backend/services/recommendationService.js`

## 验收标准（完成定义）

- [ ] GET /api/recommendations → 200 + 推荐列表（来自pipeline_stats：7天内trigger_count≥3且未被抑制）
- [ ] 推荐触发条件（三条件同时满足）：①7天内trigger_count≥3；②冷却期：last_recommended_at为NULL或距今>24h；③抑制期：不存在useful=FALSE且created_at在7天内的同pipeline_id反馈
- [ ] 同一时刻最多展示1张（按7天触发次数降序选最高）
- [ ] POST /api/recommendations/feedback body:{pipeline_id,useful:boolean} → 201
- [ ] useful=false时写入recommendation_feedback，7天内该pipeline_id不再推荐
- [ ] GET /api/recommendations 更新last_recommended_at（展示时间戳）
- [ ] SQL查询效率：有index on pipeline_stats.pipeline_id, recommendation_feedback.pipeline_id

## 上下文引用（来自规格文档）

- SRS：SRS FR-16/17/18/19, SRS修订版图6主流程
- PRD：PRD §9.3 推荐触发规则

## 为什么这个任务在 L2

纯SQL统计推荐，无AI依赖，仅读写SQLite，与其他L2服务零耦合

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
