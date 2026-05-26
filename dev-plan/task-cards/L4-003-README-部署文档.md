# L4-003 · README & 部署文档

> 项目：**智能待办事项系统** · 层级：**L4** · 角色：**fullstack** · 复杂度：**S** （≈45 min）

## 任务目标

撰写并完善 README（5 步内本地启动，满足 NFR-12）和 docs/deployment.md（环境变量说明、.env.example 字段、pios Token 配置方法）；同步更新 README 中的项目指标。

## 前置依赖（必须已完成才能开工）

- `L3-002` — 前后端 API 对接（替换 Mock）（产出：frontend/src/utils/api.js（更新）, frontend/src/context/AppContext.jsx（更新））

## 你将消费的契约（L1 产物）

- _无消费契约_

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `docs/deployment.md`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `docs/deployment.md`

## 验收标准（完成定义）

- [ ] README.md：5步内完成本地启动（git clone→npm install backend→npm install frontend→配置.env→npm start + npm run dev）
- [ ] README包含：系统架构简图、环境要求（Node.js≥18、浏览器版本）、.env变量说明
- [ ] docs/deployment.md：HTTPS部署方案（Nginx反向代理+SSL，满足iOS Safari Web Speech API要求）
- [ ] 部署文档包含：πOS Token配置步骤、CORS FRONTEND_URL环境变量设置方法、SQLite备份建议
- [ ] SRS NFR-12：5步内完成本地启动验证通过

## 上下文引用（来自规格文档）

- SRS：SRS NFR-12, SRS AS-01 HTTPS部署假设
- PRD：PRD §12.1 上线方式

## 为什么这个任务在 L4

文档工作并行于测试，无代码依赖

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
