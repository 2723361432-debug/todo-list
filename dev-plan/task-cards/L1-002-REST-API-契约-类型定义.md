# L1-002 · REST API 契约 + 类型定义

> 项目：**智能待办事项系统** · 层级：**L1** · 角色：**fullstack** · 复杂度：**M** （≈60 min）

## 任务目标

定义全部 13 个 REST 端点的请求/响应 Schema（JSDoc）；实体类型 Task（title 字段，6 字段）、PipelineConfig、AppConfig 等；错误信封格式——前后端共同遵守的类型契约。

## 前置依赖（必须已完成才能开工）

- `L0-001` — 仓库脚手架（Repo Scaffold）（产出：backend/package.json, backend/.env.example, backend/app.js, frontend/package.json, frontend/vite.config.js, frontend/index.html, .gitignore, README.md）

## 你将消费的契约（L1 产物）

- _无消费契约_

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `shared/types.js`
- `docs/api-contract.md`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `contract.api-types`
- `shared/types.js`
- `docs/api-contract.md`

## 验收标准（完成定义）

- [ ] types.js 导出 JSDoc @typedef：Task、PipelineConfig、PipelineStat、AppConfig、RecommendationFeedback
- [ ] Task typedef字段：id(number)、title(string)、status('pending'|'completed')、pipeline_id(string|null)、created_at(number)、updated_at(number|null)
- [ ] api-contract.md 列出全部13个端点（路径、HTTP方法、请求体、响应体示例、错误码）
- [ ] 错误信封格式统一：{error:{code:string,message:string}}
- [ ] HTTP状态码规范：200/201/204/400/404/503
- [ ] 文档与SRS修订版图表数据模型一致（title不是name，6字段）

## 上下文引用（来自规格文档）

- SRS：SRS §8 接口需求, SRS修订版图5/图6 API路径
- TRS：TRS §6.1 接口风格约定

## 为什么这个任务在 L1

API契约是前后端解耦的唯一边界，决定全局并行度：所有L2后端和前端任务都以此为实现基准

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
