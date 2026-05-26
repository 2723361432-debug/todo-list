# L0-001 · 仓库脚手架（Repo Scaffold）

> 项目：**智能待办事项系统** · 层级：**L0** · 角色：**fullstack** · 复杂度：**S** （≈30 min）

## 任务目标

初始化 monorepo 骨架：Node.js 20 + Express 4 后端（better-sqlite3、cors、dotenv）+ React 19 + Vite 8 前端脚手架；建立统一目录结构（backend/、frontend/、shared/、docs/）和 .env.example 配置模板。

## 前置依赖（必须已完成才能开工）

- _无前置依赖，可立即启动_

## 你将消费的契约（L1 产物）

- _无消费契约_

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `backend/package.json`
- `backend/.env.example`
- `backend/app.js`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`
- `.gitignore`
- `README.md`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `backend/package.json`
- `backend/.env.example`
- `backend/app.js`
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`
- `.gitignore`
- `README.md`

## 验收标准（完成定义）

- [ ] frontend: npm install && npm run dev 启动成功，浏览器访问 http://localhost:5173 无报错
- [ ] backend: npm install && node app.js 启动成功，端口3001可访问
- [ ] .env.example 包含所有环境变量占位符：PORT、FRONTEND_URL、PIOS_API_BASE_URL、PIOS_API_TOKEN
- [ ] .gitignore 包含 .env、node_modules、dist、*.db
- [ ] 两个工程目录结构符合 TRS §2.3 前后端分层规范

## 上下文引用（来自规格文档）

- SRS：SRS CON-03 Node.js≥18
- TRS：TRS §2.3 前后端分层架构

## 为什么这个任务在 L0

仓库脚手架是所有后续工作的物理基础，必须串行先行

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
