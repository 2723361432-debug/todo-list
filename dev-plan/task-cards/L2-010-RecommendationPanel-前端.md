# L2-010 · RecommendationPanel（前端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**M** （≈90 min）

## 任务目标

实现 RecommendationPanel：侧边栏推荐卡展示（GET /api/recommendations），采纳/忽略反馈按钮（POST /api/recommendations/feedback），数据积累中空态提示，同时最多 1 张卡。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/components/RecommendationPanel.jsx`
- `frontend/src/components/RecommendationPanel.module.css`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/components/RecommendationPanel.jsx`
- `frontend/src/components/RecommendationPanel.module.css`

## 验收标准（完成定义）

- [ ] 侧边栏展示推荐卡片：管线名称、触发次数、推荐原因
- [ ] 最多展示1张推荐卡（同时满足条件时按触发次数降序取最高）
- [ ] 采纳按钮：dispatch submitFeedback({pipeline_id, useful:true})，卡片消失
- [ ] 忽略按钮：dispatch submitFeedback({pipeline_id, useful:false})，7天内不再出现（suppressUntil由后端设置）
- [ ] 无推荐时显示'数据积累中，暂无推荐'（FR-19）
- [ ] 初次渲染时fetchRecommendations()加载数据
- [ ] 条件满足（7天≥3次）时卡片自动出现（轮询GET /api/recommendations 每60s或页面加载时）

## 上下文引用（来自规格文档）

- SRS：SRS FR-17/18/19
- PRD：PRD §9.3 推荐触发规则

## 为什么这个任务在 L2

独立侧边栏组件，依赖mock-api的recommendations端点

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
