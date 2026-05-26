# L2-009 · ConfigPanel（前端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**M** （≈120 min）

## 任务目标

实现 ConfigPanel：管线配置增删（baseURL 输入 + pipeline_id），pios Token 安全说明（存后端 .env，前端仅显示掩码），轮询全局开关（P1），满足 NFR-07 Token 不出现在前端。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/components/ConfigPanel.jsx`
- `frontend/src/components/ConfigPanel.module.css`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/components/ConfigPanel.jsx`
- `frontend/src/components/ConfigPanel.module.css`

## 验收标准（完成定义）

- [ ] 管线配置区：展示pipeline_configs列表，支持添加（填写Pipeline ID+显示名称+API baseURL）和删除
- [ ] Token说明：显示'πOS Token由运维配置于后端.env，无需在此页面填写'提示文案（CON-06）
- [ ] hasPiosToken:true时显示'已配置'状态标识；false时显示'未配置'（不回显明文Token）
- [ ] 全局轮询开关（FR-15）：toggle按钮，dispatch updateConfig({polling_enabled:bool})
- [ ] 保存成功后Toast提示，失败时错误提示
- [ ] 管线列表变化后AppContext中pipeline_configs同步更新（触发管线选择列表刷新）

## 上下文引用（来自规格文档）

- SRS：SRS FR-11/15, SRS CON-06 Token安全
- PRD：PRD §7.3 配置页规格

## 为什么这个任务在 L2

配置面板组件，依赖mock-api的pipeline-configs和config端点

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
