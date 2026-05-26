# L2-007 · InputPanel + VoiceButton + PipelineTrigger Modal（前端）

> 项目：**智能待办事项系统** · 层级：**L2** · 角色：**frontend** · 复杂度：**L** （≈150 min）

## 任务目标

实现 InputPanel（输入框 + 添加按钮，空文本拦截）、VoiceButton（Web Speech API 长按录音，Firefox 桌面 DOM 不存在，识别结果填入输入框不自动提交）和 PipelineTriggerModal（管线列表 + 二次确认，默认焦点在取消）。

## 前置依赖（必须已完成才能开工）

- `L1-003` — Mock API Server（产出：contract.mock-api, backend/mock-server.js）
- `L1-004` — AppContext Skeleton + Fetch Utilities（产出：contract.app-context, frontend/src/context/AppContext.jsx, frontend/src/utils/api.js）

## 你将消费的契约（L1 产物）

- `contract.mock-api` （由 L1-003 产出，类型 mock）
- `contract.app-context` （由 L1-004 产出，类型 context）

> 这些契约定义了你的输入边界。不要假设它们之外的形状；如发现契约本身有歧义，**立刻回报**，不要私自补全。

## 你拥有的文件（排他写入）

- `frontend/src/components/InputPanel.jsx`
- `frontend/src/components/InputPanel.module.css`
- `frontend/src/components/VoiceButton.jsx`
- `frontend/src/components/VoiceButton.module.css`
- `frontend/src/components/PipelineTriggerModal.jsx`
- `frontend/src/components/PipelineTriggerModal.module.css`
- `frontend/src/hooks/useSpeechRecognition.js`

> 这些路径下的文件由你独占。**不要写入此清单外的任何文件**——其他 Agent 也在并行工作，跨界写入会导致合并冲突。

## 你需要产出的成果

- `frontend/src/components/InputPanel.jsx`
- `frontend/src/components/InputPanel.module.css`
- `frontend/src/components/VoiceButton.jsx`
- `frontend/src/components/VoiceButton.module.css`
- `frontend/src/components/PipelineTriggerModal.jsx`
- `frontend/src/components/PipelineTriggerModal.module.css`
- `frontend/src/hooks/useSpeechRecognition.js`

## 验收标准（完成定义）

- [ ] InputPanel：输入框+添加按钮，回车/点击提交，空文本拦截（输入框抖动动效+焦点保持），成功后清空
- [ ] VoiceButton：'window.SpeechRecognition||window.webkitSpeechRecognition'存在时渲染，否则DOM中不存在（FR-08 BR-08a）
- [ ] 长按触发recognition.start()，松开触发recognition.stop()
- [ ] 识别中：脉冲动效 + '正在识别...'文字标签（BR-08b）
- [ ] 识别成功：结果填入InputPanel输入框，不自动提交（BR-09a）
- [ ] 识别失败/空结果：不自动提交，显示错误提示2s（BR-08c）
- [ ] 首次请求麦克风权限时展示说明文案
- [ ] PipelineTriggerModal：识别成功后可选弹出，展示pipeline_configs列表，选择后二次确认（默认焦点在'取消'），确认后dispatch triggerPipeline
- [ ] 触发成功后5s内显示撤回提示栏

## 上下文引用（来自规格文档）

- SRS：SRS FR-08/09/10, SRS修订版图5语音时序图
- PRD：PRD §7.3 FR-08/09规格卡, PRD §8 信任设计

## 为什么这个任务在 L2

输入区全部组件，依赖mock-api返回pipeline_configs列表，无L2间组件依赖

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
