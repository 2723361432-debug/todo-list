# L2-005 · App Config Service & Routes（后端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**backend** · 复杂度：**S** （≈60 min）

## 任务目标

实现应用配置读写：GET/PATCH /api/config，操作 app_config 表（UPSERT）；pios Token 存储与脱敏（前端只见掩码，满足 NFR-07）；轮询全局开关持久化。

## 前置依赖（必须已完成才能开工）

- `L1-001` — SQLite Schema & db.js 初始化器（产出：contract.sqlite-schema, backend/db.js, backend/migrations/init.sql）
- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.sqlite-schema` （由 L1-001 产出，类型 schema）
- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/routes/config.js`
- `backend/controllers/configController.js`
- `backend/services/configService.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `backend/routes/config.js`
- `backend/controllers/configController.js`
- `backend/services/configService.js`

## 验收标准（完成定义）

- [ ] GET /api/config → 200 + AppConfig对象（含所有app_config键值）
- [ ] PATCH /api/config body:Partial<AppConfig> → 200 + 更新后配置
- [ ] configService.updateConfig()使用db.transaction()逐键UPSERT app_config表
- [ ] pios_api_token写入后不在响应体中回显（以hasPiosToken:boolean替代）
- [ ] polling_enabled存储于app_config（FR-15全局轮询开关）
- [ ] GET /api/config读取polling_enabled状态，供SSE服务判断是否启动轮询

## 上下文引用（来自规格文档）

- SRS：SRS FR-11/15, SRS修订版图8 app_config表
- TRS：TRS §5.2 DL-05配置读写链路

## 为什么这个任务在 L2

全局配置键值存储，简单UPSERT，无复杂业务逻辑

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
