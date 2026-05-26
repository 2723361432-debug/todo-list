# L1-004 · AppContext Skeleton + Fetch Utilities

> 项目：**智能待办事项系统** · 层级：**L1** · 角色：**frontend** · 复杂度：**M** （≈60 min）

## 任务目标

建立 React AppContext（useReducer 全局状态骨架，含全部 action 类型定义和初始 state 形态）+ api.js fetch 封装（错误处理、JSON 解析）；reducer 处理器空实现，供全部前端 L2 任务消费。

## 前置依赖（必须已完成才能开工）

- `L1-002` — REST API 契约 + 类型定义（产出：contract.api-types, shared/types.js, docs/api-contract.md）

## 你将消费的契约（L1 产物）

- `contract.api-types` （由 L1-002 产出，类型 types）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/context/AppContext.jsx`
- `frontend/src/utils/api.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `contract.app-context`
- `frontend/src/context/AppContext.jsx`
- `frontend/src/utils/api.js`

## 验收标准（完成定义）

- [ ] AppContext导出useAppContext() hook，返回{state, dispatch}
- [ ] state形态：{tasks:Task[], pipelineConfigs:PipelineConfig[], recommendations:RecommendationFeedback[], config:AppConfig, loading:boolean, error:string|null}
- [ ] action类型全部定义并导出常量：INIT_TASKS、ADD_TASK、UPDATE_TASK、DELETE_TASK、SET_PIPELINE_CONFIGS、UPDATE_TASK_PIPELINE_STATUS、SET_RECOMMENDATIONS、SET_CONFIG、SET_LOADING、SET_ERROR
- [ ] reducer空实现（直接return state），不影响组件挂载
- [ ] api.js导出：fetchTasks()、createTask()、updateTask()、deleteTask()、fetchPipelineConfigs()、createPipelineConfig()、deletePipelineConfig()、triggerPipeline()、fetchRecommendations()、submitFeedback()、fetchConfig()、updateConfig()，均指向mock-server端口
- [ ] 所有fetch函数有统一错误处理（非200抛出含code的Error）

## 上下文引用（来自规格文档）

- TRS：TRS §2.5 原则五React Context
- OTHER：contract.api-types

## 为什么这个任务在 L1

AppContext骨架使所有前端组件可在空reducer下独立开发和渲染，无需等待完整状态逻辑

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
