# L2-006 · TaskListPanel + TaskItem（前端 UI）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**L** （≈150 min）

## 任务目标

实现 TaskListPanel（过滤器三档 全部/进行中/已完成 + 列表四态：正常/空/加载/错误）和 TaskItem（完成复选框双向切换、双击内联编辑、删除确认弹窗、管线失败红色标签）。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/components/TaskListPanel.jsx`
- `frontend/src/components/TaskListPanel.module.css`
- `frontend/src/components/TaskItem.jsx`
- `frontend/src/components/TaskItem.module.css`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/components/TaskListPanel.jsx`
- `frontend/src/components/TaskListPanel.module.css`
- `frontend/src/components/TaskItem.jsx`
- `frontend/src/components/TaskItem.module.css`

## 验收标准（完成定义）

- [ ] TaskListPanel渲染任务列表，三态筛选（全部/进行中/已完成）切换正确，筛选为前端内存操作不触发API
- [ ] TaskItem：复选框切换status；双击进入内联编辑模式（input，自动全选文字）
- [ ] 内联编辑：回车/失焦+非空→dispatch UPDATE_TASK；Esc或空文本→恢复原值
- [ ] 删除：点击按钮→弹确认对话框（默认焦点在'取消'）→确认dispatch DELETE_TASK
- [ ] TaskItem展示pipeline_id关联管线的pipelineStatus徽章（running/completed/failed对应颜色）
- [ ] 管线失败时显示红色'管线失败'警告标签（FR-14）
- [ ] 空状态：列表为空时显示引导文案（不出现空白区域）
- [ ] 加载状态：初始化时显示3个骨架占位条
- [ ] aria-label：所有图标按钮有中文可读标签

## 上下文引用（来自规格文档）

- SRS：SRS FR-02/03/04/05, SRS修订版图7状态机
- PRD：PRD §7.3 功能规格卡

## 为什么这个任务在 L2

纯前端UI，依赖mock-server和AppContext骨架，与其他前端L2组件零耦合（通过AppContext解耦）

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
