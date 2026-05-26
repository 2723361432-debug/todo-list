# L2-011 · App Shell & 全局 UX（前端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**M** （≈120 min）

## 任务目标

实现 App.jsx 整体布局（768px 响应式断点）、全局 Toast 通知系统、错误 Banner、加载骨架屏；满足移动端适配（375px 无溢出、按钮 >=44x44px）和 NFR-11 后端异常友好提示不白屏。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/App.jsx`
- `frontend/src/App.module.css`
- `frontend/src/components/Toast.jsx`
- `frontend/src/components/Toast.module.css`
- `frontend/src/components/ErrorBanner.jsx`
- `frontend/src/components/ErrorBanner.module.css`
- `frontend/src/index.css`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/App.jsx`
- `frontend/src/App.module.css`
- `frontend/src/components/Toast.jsx`
- `frontend/src/components/Toast.module.css`
- `frontend/src/components/ErrorBanner.jsx`
- `frontend/src/components/ErrorBanner.module.css`
- `frontend/src/index.css`

## 验收标准（完成定义）

- [ ] App.jsx整体布局：输入区（顶部）+ 任务列表（中部）+ 推荐侧边栏（第二期条件渲染）+ 配置面板（第二期条件渲染）
- [ ] 响应式CSS：视口≤768px→单列布局；>768px→主列+侧边栏布局（FR-07）
- [ ] 375px宽度无横向溢出，输入框全宽，语音按钮可见（PRD UX-01/02）
- [ ] ErrorBanner：非阻断轻提示横幅，3s自动消失或手动关闭（后端不可用时显示'服务暂时不可用，请稍后重试'）
- [ ] Toast：成功/错误操作反馈，200ms内产生视觉响应（PRD UX-07）
- [ ] 骨架屏：初始化GET /api/tasks期间显示3个占位任务条（PRD §7.6 加载态）
- [ ] 所有图标按钮有中文aria-label（PRD UX-05）
- [ ] Tab键可完成完整增删改查流程（PRD UX-04）

## 上下文引用（来自规格文档）

- SRS：SRS FR-07/NFR-11
- PRD：PRD §7.6 主页面四态规格, PRD UX-01~07

## 为什么这个任务在 L2

App壳层和全局UX组件，不承载业务逻辑，纯UI职责

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
