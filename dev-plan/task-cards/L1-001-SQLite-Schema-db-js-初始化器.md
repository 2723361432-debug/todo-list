# L1-001 · SQLite Schema & db.js 初始化器

> 项目：**智能待办事项系统** · 层级：**L1** · 角色：**backend** · 复杂度：**S** （≈45 min）

## 任务目标

建立 5 张 SQLite 表的完整 DDL，完成 db.js 初始化（WAL 模式，busy_timeout=5000），为全部后端服务提供数据层契约。

## 前置依赖（必须已完成才能开工）

- `L0-001` — 仓库脚手架（Repo Scaffold）（产出：backend/package.json, backend/.env.example, backend/app.js, frontend/package.json, frontend/vite.config.js, frontend/index.html, .gitignore, README.md）

## 你将消费的契约（L1 产物）

- _无消费契约_

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/db.js`
- `backend/migrations/init.sql`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `contract.sqlite-schema`
- `backend/db.js`
- `backend/migrations/init.sql`

## 验收标准（完成定义）

- [ ] node backend/db.js 执行后生成 todo.db，包含5张表：tasks、pipeline_configs、pipeline_stats、app_config、recommendation_feedback
- [ ] tasks表字段：id(PK AUTO INCREMENT)、title(NOT NULL TEXT)、status(DEFAULT 'pending')、pipeline_id(NULL TEXT)、created_at(DATETIME DEFAULT CURRENT_TIMESTAMP)、updated_at(DATETIME)
- [ ] pipeline_configs表字段：id、pipeline_id(UNIQUE NOT NULL)、display_name、api_base_url、created_at
- [ ] pipeline_stats表字段：id、pipeline_id(FK)、trigger_count(DEFAULT 0)、last_triggered_at
- [ ] app_config表字段：key(PK)、value、updated_at
- [ ] recommendation_feedback表字段：id、pipeline_id(FK)、useful(BOOLEAN)、created_at
- [ ] PRAGMA journal_mode=WAL 已启用
- [ ] db.pragma('busy_timeout = 5000') 已配置
- [ ] db实例以module.exports导出，供所有service层直接引用

## 上下文引用（来自规格文档）

- SRS：SRS §6.2 核心数据模型（修订版图8）, SRS §6.3 数据存储规划
- TRS：TRS §5.4 SQLite事务边界

## 为什么这个任务在 L1

db.js是所有后端服务的唯一数据库入口，必须在L2实现前固化，是后端并行的关键契约

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
