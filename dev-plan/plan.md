# 智能待办事项系统 · 并行开发规划

> React 19 + Node.js 20 + SQLite 全栈应用：Todo List + 语音录入 + πOS 管线集成。P0 第一期含任务 CRUD / 语音录入 / SSE 管线状态推送；P1 第二期含推荐面板 / 配置管理。

本文档由 `parallel-dev-planner` skill 从三份规格说明书（SRS / PRD / TRS）自动派生，
以"契约先行 + 分层 DAG"为方法论，目标是让多 Agent 在最短关键路径下最大并行开发。

## 1. 总览指标

| 指标 | 数值 | 说明 |
|---|---|---|
| 任务总数 | 22 | 全部 DAG 节点 |
| 并行批次数 | 6 | 拓扑分层后的层数，越少越好 |
| 关键路径长度 | 6 | 最长依赖链，决定最短工期 |
| 关键路径 | L0-001 → L1-001 → L2-001 → L3-001 → L3-002 → L3-003 | 串行瓶颈节点序列 |
| 理论并行度 | 3.67 | 总节点 ÷ 关键路径长度 |
| L2 比例 | 0.5 | L2 实现层占比，建议 ≥ 0.6 |
| 峰值批宽度 | 7 | 同一批次最大并行 Agent 数 |
| 分层统计 | {"L0": 1, "L1": 4, "L2": 11, "L3": 3, "L4": 3} | L0/L1/L2/L3/L4 各层节点数 |

## 2. 任务粒度

- **粒度**：module
- **选择理由**：19个功能点、5个UI面板，属中型项目，模块级粒度（25-35节点）最优；功能级过细导致协调开销，服务级过粗单Agent任务过重

## 3. 文档间矛盾与解决

_未检测到三份文档之间的实质矛盾。_

## 4. 并行批次执行计划

> 建议按批次顺序派发：同一批次内所有任务**同时并行启动**，全部完成后再进入下一批次。
> 实际执行可允许批次之间流式重叠（一旦某节点的所有依赖完成就启动），不必严格按批次卡点。

### 批次 1（1 并行任务）

- **L0-001** [L0/fullstack] 仓库脚手架（Repo Scaffold）  *(≈30min, S)*

### 批次 2（2 并行任务）

- **L1-001** [L1/backend] SQLite Schema & db.js 初始化器  *(≈45min, S)*
- **L1-002** [L1/fullstack] REST API 契约 + 类型定义  *(≈60min, M)*

### 批次 3（7 并行任务）

- **L1-003** [L1/backend] Mock API Server  *(≈90min, M)*
- **L1-004** [L1/frontend] AppContext Skeleton + Fetch Utilities  *(≈60min, M)*
- **L2-001** [L2/backend] Task Service & Routes（后端）  *(≈120min, M)*
- **L2-002** [L2/backend] Pipeline Config Service & Routes（后端）  *(≈60min, S)*
- **L2-003** [L2/backend] Pipeline Trigger & SSE Status Push（后端）  *(≈150min, L)*
- **L2-004** [L2/backend] Recommendation Service & Routes（后端）  *(≈120min, M)*
- **L2-005** [L2/backend] App Config Service & Routes（后端）  *(≈60min, S)*

### 批次 4（7 并行任务）

- **L2-006** [L2/frontend] TaskListPanel + TaskItem（前端 UI）  *(≈150min, L)*
- **L2-007** [L2/frontend] InputPanel + VoiceButton + PipelineTrigger Modal（前端）  *(≈150min, L)*
- **L2-008** [L2/frontend] usePipelineSSE Hook（前端）  *(≈90min, M)*
- **L2-009** [L2/frontend] ConfigPanel（前端）  *(≈120min, M)*
- **L2-010** [L2/frontend] RecommendationPanel（前端）  *(≈90min, M)*
- **L2-011** [L2/frontend] App Shell & 全局 UX（前端）  *(≈120min, M)*
- **L3-001** [L3/backend] 后端服务集成测试  *(≈90min, M)*

### 批次 5（1 并行任务）

- **L3-002** [L3/fullstack] 前后端 API 对接（替换 Mock）  *(≈120min, M)*

### 批次 6（4 并行任务）

- **L3-003** [L3/fullstack] 管线状态 SSE 端到端联调  *(≈90min, M)*
- **L4-001** [L4/fullstack] 测试套件（后端单测 + 前端组件测）  *(≈120min, M)*
- **L4-002** [L4/fullstack] NFR 验证 & 安全检查  *(≈90min, M)*
- **L4-003** [L4/fullstack] README & 部署文档  *(≈45min, S)*


## 5. 全部任务详表

> 每个任务都对应 `task-cards/` 下一份独立 Agent prompt，可直接复制派发。

#### L0-001 · 仓库脚手架（Repo Scaffold）
- 层级 / 角色：L0 / fullstack
- 复杂度：S（≈30 min）
- 依赖：—
- 消费契约：—
- 拥有文件：`backend/package.json, backend/.env.example, backend/app.js, frontend/package.json, frontend/vite.config.js, frontend/index.html, .gitignore, README.md`
- 验收：
    - frontend: npm install && npm run dev 启动成功，浏览器访问 http://localhost:5173 无报错
    - backend: npm install && node app.js 启动成功，端口3001可访问
    - .env.example 包含所有环境变量占位符：PORT、FRONTEND_URL、PIOS_API_BASE_URL、PIOS_API_TOKEN
    - .gitignore 包含 .env、node_modules、dist、*.db
    - 两个工程目录结构符合 TRS §2.3 前后端分层规范

#### L1-001 · SQLite Schema & db.js 初始化器
- 层级 / 角色：L1 / backend
- 复杂度：S（≈45 min）
- 依赖：L0-001
- 消费契约：—
- 拥有文件：`backend/db.js, backend/migrations/init.sql`
- 验收：
    - node backend/db.js 执行后生成 todo.db，包含5张表：tasks、pipeline_configs、pipeline_stats、app_config、recommendation_feedback
    - tasks表字段：id(PK AUTO INCREMENT)、title(NOT NULL TEXT)、status(DEFAULT 'pending')、pipeline_id(NULL TEXT)、created_at(DATETIME DEFAULT CURRENT_TIMESTAMP)、updated_at(DATETIME)
    - pipeline_configs表字段：id、pipeline_id(UNIQUE NOT NULL)、display_name、api_base_url、created_at
    - pipeline_stats表字段：id、pipeline_id(FK)、trigger_count(DEFAULT 0)、last_triggered_at
    - app_config表字段：key(PK)、value、updated_at
    - recommendation_feedback表字段：id、pipeline_id(FK)、useful(BOOLEAN)、created_at
    - PRAGMA journal_mode=WAL 已启用
    - db.pragma('busy_timeout = 5000') 已配置
    - db实例以module.exports导出，供所有service层直接引用

#### L1-002 · REST API 契约 + 类型定义
- 层级 / 角色：L1 / fullstack
- 复杂度：M（≈60 min）
- 依赖：L0-001
- 消费契约：—
- 拥有文件：`shared/types.js, docs/api-contract.md`
- 验收：
    - types.js 导出 JSDoc @typedef：Task、PipelineConfig、PipelineStat、AppConfig、RecommendationFeedback
    - Task typedef字段：id(number)、title(string)、status('pending'|'completed')、pipeline_id(string|null)、created_at(number)、updated_at(number|null)
    - api-contract.md 列出全部13个端点（路径、HTTP方法、请求体、响应体示例、错误码）
    - 错误信封格式统一：{error:{code:string,message:string}}
    - HTTP状态码规范：200/201/204/400/404/503
    - 文档与SRS修订版图表数据模型一致（title不是name，6字段）

#### L1-003 · Mock API Server
- 层级 / 角色：L1 / backend
- 复杂度：M（≈90 min）
- 依赖：L1-002
- 消费契约：contract.api-types
- 拥有文件：`backend/mock-server.js`
- 验收：
    - node backend/mock-server.js 在3001端口启动
    - 覆盖全部13个端点，返回符合contract.api-types的stub数据
    - GET /api/tasks 返回至少3条示例任务（含pending/completed混合）
    - GET /api/pipeline-configs 返回至少2条示例管线配置
    - GET /api/pipeline/status-stream 返回SSE连接，每5s推送一次heartbeat
    - GET /api/recommendations 返回至少1条示例推荐
    - 所有POST/PATCH/DELETE端点返回对应成功状态码和stub响应体
    - 前端L2任务可直接对接此Mock Server完成完整UI开发

#### L1-004 · AppContext Skeleton + Fetch Utilities
- 层级 / 角色：L1 / frontend
- 复杂度：M（≈60 min）
- 依赖：L1-002
- 消费契约：contract.api-types
- 拥有文件：`frontend/src/context/AppContext.jsx, frontend/src/utils/api.js`
- 验收：
    - AppContext导出useAppContext() hook，返回{state, dispatch}
    - state形态：{tasks:Task[], pipelineConfigs:PipelineConfig[], recommendations:RecommendationFeedback[], config:AppConfig, loading:boolean, error:string|null}
    - action类型全部定义并导出常量：INIT_TASKS、ADD_TASK、UPDATE_TASK、DELETE_TASK、SET_PIPELINE_CONFIGS、UPDATE_TASK_PIPELINE_STATUS、SET_RECOMMENDATIONS、SET_CONFIG、SET_LOADING、SET_ERROR
    - reducer空实现（直接return state），不影响组件挂载
    - api.js导出：fetchTasks()、createTask()、updateTask()、deleteTask()、fetchPipelineConfigs()、createPipelineConfig()、deletePipelineConfig()、triggerPipeline()、fetchRecommendations()、submitFeedback()、fetchConfig()、updateConfig()，均指向mock-server端口
    - 所有fetch函数有统一错误处理（非200抛出含code的Error）

#### L2-001 · Task Service & Routes（后端）
- 层级 / 角色：L2 / backend
- 复杂度：M（≈120 min）
- 依赖：L1-001, L1-002
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/routes/tasks.js, backend/controllers/taskController.js, backend/services/taskService.js`
- 验收：
    - GET /api/tasks → 200 + Task[]，按created_at DESC排序
    - POST /api/tasks body:{title(required),status?,pipeline_id?} → 201 + Task；title为空→400
    - PATCH /api/tasks/:id body可选字段{title,status,pipeline_id,updated_at} → 200 + Task；不存在→404
    - DELETE /api/tasks/:id → 204；不存在→404
    - taskService.create() 生成id=task_<Date.now()>_<uuid前8位>，服务端设置created_at
    - updatedAt在每次PATCH成功后由后端强制覆写
    - SQLite事务：批量操作使用db.transaction()包裹
    - curl测试：所有4个端点返回正确HTTP状态码和JSON

#### L2-002 · Pipeline Config Service & Routes（后端）
- 层级 / 角色：L2 / backend
- 复杂度：S（≈60 min）
- 依赖：L1-001, L1-002
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/routes/pipeline-configs.js, backend/controllers/pipelineConfigController.js, backend/services/pipelineConfigService.js`
- 验收：
    - GET /api/pipeline-configs → 200 + PipelineConfig[]
    - POST /api/pipeline-configs body:{pipeline_id(required),display_name,api_base_url} → 201 + PipelineConfig；pipeline_id重复→409
    - DELETE /api/pipeline-configs/:id → 204；不存在→404
    - pipeline_id字段UNIQUE约束在SQLite层强制（不依赖应用层去重）
    - curl测试：3个端点均正常

#### L2-003 · Pipeline Trigger & SSE Status Push（后端）
- 层级 / 角色：L2 / backend
- 复杂度：L（≈150 min）
- 依赖：L1-001, L1-002
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/routes/pipelines.js, backend/routes/sseStream.js, backend/controllers/pipelineController.js, backend/services/piosClient.js, backend/services/sseService.js`
- 验收：
    - POST /api/pipelines/:id/trigger body:{pipelineId} → 200 + {executionId}；PIOS_API_BASE_URL未配置→503
    - piosClient.js: Bearer Token从.env注入请求头；5xx重试2次+1s退避；401不重试
    - 触发成功后写入pipeline_stats（trigger_count+1，last_triggered_at=NOW）
    - GET /api/pipeline/status-stream: 响应头Content-Type:text/event-stream + Cache-Control:no-cache + Connection:keep-alive
    - 数据推送计时器：每5s轮询πOS状态，状态变更→立即推送SSE帧
    - 心跳计时器：连续30s无数据帧→发送':heartbeat\n\n'
    - 客户端断开→clearInterval清理两个计时器，调用res.end()
    - πOS状态别名映射：completed/success→completed，failed/error→failed，running→running
    - PIOS_API_BASE_URL未配置时，SSE连接保持但不发任何事件（静默模式）

#### L2-004 · Recommendation Service & Routes（后端）
- 层级 / 角色：L2 / backend
- 复杂度：M（≈120 min）
- 依赖：L1-001, L1-002
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/routes/recommendations.js, backend/controllers/recommendationController.js, backend/services/recommendationService.js`
- 验收：
    - GET /api/recommendations → 200 + 推荐列表（来自pipeline_stats：7天内trigger_count≥3且未被抑制）
    - 推荐触发条件（三条件同时满足）：①7天内trigger_count≥3；②冷却期：last_recommended_at为NULL或距今>24h；③抑制期：不存在useful=FALSE且created_at在7天内的同pipeline_id反馈
    - 同一时刻最多展示1张（按7天触发次数降序选最高）
    - POST /api/recommendations/feedback body:{pipeline_id,useful:boolean} → 201
    - useful=false时写入recommendation_feedback，7天内该pipeline_id不再推荐
    - GET /api/recommendations 更新last_recommended_at（展示时间戳）
    - SQL查询效率：有index on pipeline_stats.pipeline_id, recommendation_feedback.pipeline_id

#### L2-005 · App Config Service & Routes（后端）
- 层级 / 角色：L2 / backend
- 复杂度：S（≈60 min）
- 依赖：L1-001, L1-002
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/routes/config.js, backend/controllers/configController.js, backend/services/configService.js`
- 验收：
    - GET /api/config → 200 + AppConfig对象（含所有app_config键值）
    - PATCH /api/config body:Partial<AppConfig> → 200 + 更新后配置
    - configService.updateConfig()使用db.transaction()逐键UPSERT app_config表
    - pios_api_token写入后不在响应体中回显（以hasPiosToken:boolean替代）
    - polling_enabled存储于app_config（FR-15全局轮询开关）
    - GET /api/config读取polling_enabled状态，供SSE服务判断是否启动轮询

#### L2-006 · TaskListPanel + TaskItem（前端 UI）
- 层级 / 角色：L2 / frontend
- 复杂度：L（≈150 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/components/TaskListPanel.jsx, frontend/src/components/TaskListPanel.module.css, frontend/src/components/TaskItem.jsx, frontend/src/components/TaskItem.module.css`
- 验收：
    - TaskListPanel渲染任务列表，三态筛选（全部/进行中/已完成）切换正确，筛选为前端内存操作不触发API
    - TaskItem：复选框切换status；双击进入内联编辑模式（input，自动全选文字）
    - 内联编辑：回车/失焦+非空→dispatch UPDATE_TASK；Esc或空文本→恢复原值
    - 删除：点击按钮→弹确认对话框（默认焦点在'取消'）→确认dispatch DELETE_TASK
    - TaskItem展示pipeline_id关联管线的pipelineStatus徽章（running/completed/failed对应颜色）
    - 管线失败时显示红色'管线失败'警告标签（FR-14）
    - 空状态：列表为空时显示引导文案（不出现空白区域）
    - 加载状态：初始化时显示3个骨架占位条
    - aria-label：所有图标按钮有中文可读标签

#### L2-007 · InputPanel + VoiceButton + PipelineTrigger Modal（前端）
- 层级 / 角色：L2 / frontend
- 复杂度：L（≈150 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/components/InputPanel.jsx, frontend/src/components/InputPanel.module.css, frontend/src/components/VoiceButton.jsx, frontend/src/components/VoiceButton.module.css, frontend/src/components/PipelineTriggerModal.jsx, frontend/src/components/PipelineTriggerModal.module.css, frontend/src/hooks/useSpeechRecognition.js`
- 验收：
    - InputPanel：输入框+添加按钮，回车/点击提交，空文本拦截（输入框抖动动效+焦点保持），成功后清空
    - VoiceButton：'window.SpeechRecognition||window.webkitSpeechRecognition'存在时渲染，否则DOM中不存在（FR-08 BR-08a）
    - 长按触发recognition.start()，松开触发recognition.stop()
    - 识别中：脉冲动效 + '正在识别...'文字标签（BR-08b）
    - 识别成功：结果填入InputPanel输入框，不自动提交（BR-09a）
    - 识别失败/空结果：不自动提交，显示错误提示2s（BR-08c）
    - 首次请求麦克风权限时展示说明文案
    - PipelineTriggerModal：识别成功后可选弹出，展示pipeline_configs列表，选择后二次确认（默认焦点在'取消'），确认后dispatch triggerPipeline
    - 触发成功后5s内显示撤回提示栏

#### L2-008 · usePipelineSSE Hook（前端）
- 层级 / 角色：L2 / frontend
- 复杂度：M（≈90 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/hooks/usePipelineSSE.js`
- 验收：
    - 组件挂载时创建new EventSource('/api/pipeline/status-stream')
    - onmessage解析data字段（JSON），dispatch UPDATE_TASK_PIPELINE_STATUS {taskId, pipelineStatus, updatedAt}
    - 接收heartbeat帧时不dispatch（仅心跳维持连接，不更新状态）
    - onerror：指数退避重连（1s/2s/4s，最大30s），console.warn记录重连次数
    - 组件卸载时eventSource.close()（无内存泄漏）
    - AppContext reducer接收UPDATE_TASK_PIPELINE_STATUS时，比较payload.updatedAt与store中现有updatedAt：payload较旧则丢弃（防乱序覆盖）
    - PIOS未配置时SSE保持连接但无事件，Hook静默等待（不显示错误）

#### L2-009 · ConfigPanel（前端）
- 层级 / 角色：L2 / frontend
- 复杂度：M（≈120 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/components/ConfigPanel.jsx, frontend/src/components/ConfigPanel.module.css`
- 验收：
    - 管线配置区：展示pipeline_configs列表，支持添加（填写Pipeline ID+显示名称+API baseURL）和删除
    - Token说明：显示'πOS Token由运维配置于后端.env，无需在此页面填写'提示文案（CON-06）
    - hasPiosToken:true时显示'已配置'状态标识；false时显示'未配置'（不回显明文Token）
    - 全局轮询开关（FR-15）：toggle按钮，dispatch updateConfig({polling_enabled:bool})
    - 保存成功后Toast提示，失败时错误提示
    - 管线列表变化后AppContext中pipeline_configs同步更新（触发管线选择列表刷新）

#### L2-010 · RecommendationPanel（前端）
- 层级 / 角色：L2 / frontend
- 复杂度：M（≈90 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/components/RecommendationPanel.jsx, frontend/src/components/RecommendationPanel.module.css`
- 验收：
    - 侧边栏展示推荐卡片：管线名称、触发次数、推荐原因
    - 最多展示1张推荐卡（同时满足条件时按触发次数降序取最高）
    - 采纳按钮：dispatch submitFeedback({pipeline_id, useful:true})，卡片消失
    - 忽略按钮：dispatch submitFeedback({pipeline_id, useful:false})，7天内不再出现（suppressUntil由后端设置）
    - 无推荐时显示'数据积累中，暂无推荐'（FR-19）
    - 初次渲染时fetchRecommendations()加载数据
    - 条件满足（7天≥3次）时卡片自动出现（轮询GET /api/recommendations 每60s或页面加载时）

#### L2-011 · App Shell & 全局 UX（前端）
- 层级 / 角色：L2 / frontend
- 复杂度：M（≈120 min）
- 依赖：L1-003, L1-004
- 消费契约：contract.mock-api, contract.app-context
- 拥有文件：`frontend/src/App.jsx, frontend/src/App.module.css, frontend/src/components/Toast.jsx, frontend/src/components/Toast.module.css, frontend/src/components/ErrorBanner.jsx, frontend/src/components/ErrorBanner.module.css, frontend/src/index.css`
- 验收：
    - App.jsx整体布局：输入区（顶部）+ 任务列表（中部）+ 推荐侧边栏（第二期条件渲染）+ 配置面板（第二期条件渲染）
    - 响应式CSS：视口≤768px→单列布局；>768px→主列+侧边栏布局（FR-07）
    - 375px宽度无横向溢出，输入框全宽，语音按钮可见（PRD UX-01/02）
    - ErrorBanner：非阻断轻提示横幅，3s自动消失或手动关闭（后端不可用时显示'服务暂时不可用，请稍后重试'）
    - Toast：成功/错误操作反馈，200ms内产生视觉响应（PRD UX-07）
    - 骨架屏：初始化GET /api/tasks期间显示3个占位任务条（PRD §7.6 加载态）
    - 所有图标按钮有中文aria-label（PRD UX-05）
    - Tab键可完成完整增删改查流程（PRD UX-04）

#### L3-001 · 后端服务集成测试
- 层级 / 角色：L3 / backend
- 复杂度：M（≈90 min）
- 依赖：L2-001, L2-002, L2-003, L2-004, L2-005
- 消费契约：contract.sqlite-schema, contract.api-types
- 拥有文件：`backend/tests/integration/`
- 验收：
    - backend/app.js注册所有路由（tasks/pipeline-configs/pipelines/sseStream/recommendations/config）
    - node backend/app.js 启动无报错，所有路由可访问
    - 集成测试（curl或supertest）：Task CRUD完整链路；pipeline_configs CRUD；GET /api/config → PATCH → GET验证持久化
    - SSE端点：curl -N http://localhost:3001/api/pipeline/status-stream 建立连接并收到heartbeat
    - 所有路由错误（400/404/503）返回正确格式的错误信封
    - todo.db文件在backend/目录生成且包含正确表结构

#### L3-002 · 前后端 API 对接（替换 Mock）
- 层级 / 角色：L3 / fullstack
- 复杂度：M（≈120 min）
- 依赖：L3-001, L2-006, L2-007, L2-008, L2-009, L2-010, L2-011
- 消费契约：contract.api-types
- 拥有文件：`—`
- 验收：
    - api.js所有fetch函数BASE_URL切换为真实后端（从.env.local读取VITE_API_URL）
    - AppContext reducer完整实现所有action处理器（INIT_TASKS/ADD_TASK/UPDATE_TASK/DELETE_TASK/SET_PIPELINE_CONFIGS/UPDATE_TASK_PIPELINE_STATUS等）
    - 浏览器访问前端：任务列表从后端SQLite加载；CRUD操作持久化（刷新后数据保留）
    - SRS DoD D-01~D-12 第一期验收项全部手工验证通过
    - usePipelineSSE连接真实后端SSE端点（有πOS配置时收到状态推送）

#### L3-003 · 管线状态 SSE 端到端联调
- 层级 / 角色：L3 / fullstack
- 复杂度：M（≈90 min）
- 依赖：L3-002
- 消费契约：contract.api-types
- 拥有文件：`backend/tests/e2e/pipeline-sse.test.js`
- 验收：
    - 配置PIOS_API_BASE_URL（指向测试πOS端点或Mock πOS）
    - 触发管线→SSE推送pipelineStatus=running→TaskItem状态徽章更新为'运行中'
    - πOS返回completed→SSE推送→TaskItem自动标记已完成（≤10s内，满足NFR-01）
    - πOS返回failed→SSE推送→TaskItem显示红色'管线失败'标签
    - 用户手动取消勾选后（已完成→进行中），后续SSE推送旧状态不会反向覆盖（updatedAt比较机制）
    - 关闭πOS配置（PIOS_API_BASE_URL置空）→SSE维持连接但无事件→无错误提示

#### L4-001 · 测试套件（后端单测 + 前端组件测）
- 层级 / 角色：L4 / fullstack
- 复杂度：M（≈120 min）
- 依赖：L3-002
- 消费契约：—
- 拥有文件：`backend/tests/unit/taskService.test.js, backend/tests/unit/recommendationService.test.js, frontend/src/tests/TaskItem.test.jsx, frontend/src/tests/VoiceButton.test.jsx`
- 验收：
    - taskService单测：create/update/delete/getAll各有≥2个用例，覆盖正常路径和边界（空title/不存在id）
    - recommendationService单测：推荐触发条件三条件验证；suppressUntil超时恢复；7天触发次数计算
    - TaskItem组件测：双击→编辑模式；Esc→恢复；空文本不保存
    - VoiceButton组件测：Firefox桌面不渲染；非Firefox时渲染
    - npm test 全部通过，无skipped用例

#### L4-002 · NFR 验证 & 安全检查
- 层级 / 角色：L4 / fullstack
- 复杂度：M（≈90 min）
- 依赖：L3-002
- 消费契约：—
- 拥有文件：`docs/nfr-validation-report.md`
- 验收：
    - NFR-01：测试脚本触发管线状态变更，记录SSE推送到达时间，P95≤60s（20次样本）
    - NFR-03：Chrome DevTools DOMContentLoaded≤3s（生产构建，有线网络，disable cache）
    - NFR-04：添加10条任务→F5刷新→GET /api/tasks→条数和内容与页面展示一致
    - NFR-07：DevTools Network面板：所有前端→后端请求中无Authorization头；后端响应体无token明文
    - NFR-08：Firefox桌面打开→语音按钮DOM不存在（document.querySelector('button[aria-label*="录音"]')为null）
    - NFR-10：Chrome≥90/Edge≥90/Safari≥14各浏览器核心操作路径无控制台报错
    - NFR-11：停止后端进程→前端显示ErrorBanner，不白屏
    - XSS检查：输入<script>alert(1)</script>作为任务标题，确认DOM中以textContent渲染，不执行JS
    - 结果写入docs/nfr-validation-report.md

#### L4-003 · README & 部署文档
- 层级 / 角色：L4 / fullstack
- 复杂度：S（≈45 min）
- 依赖：L3-002
- 消费契约：—
- 拥有文件：`docs/deployment.md`
- 验收：
    - README.md：5步内完成本地启动（git clone→npm install backend→npm install frontend→配置.env→npm start + npm run dev）
    - README包含：系统架构简图、环境要求（Node.js≥18、浏览器版本）、.env变量说明
    - docs/deployment.md：HTTPS部署方案（Nginx反向代理+SSL，满足iOS Safari Web Speech API要求）
    - 部署文档包含：πOS Token配置步骤、CORS FRONTEND_URL环境变量设置方法、SQLite备份建议
    - SRS NFR-12：5步内完成本地启动验证通过


## 6. 风险与未决事项

- _填空：列出规划过程中无法消解的歧义、缺失的输入、需要二次澄清的点_
- _填空：哪些 L2 节点最可能阻塞关键路径？_
- _填空：哪些 L1 契约最关键、最容易出现返工？_

## 7. 关键路径上的瓶颈

> 关键路径越短，项目最短工期越短。请人工 review：

- 当前关键路径长度：**6**
- 关键路径节点：`L0-001 → L1-001 → L2-001 → L3-001 → L3-002 → L3-003`
- 优化建议（人工补充）：
  - _可否再前置一个 L1 契约让 L2 早启动？_
  - _最末端 L3/L4 节点是否能拆细以提升后段并行度？_
  - _关键路径上是否有 complexity=L 的节点可以再拆？_

## 8. 派发指南

1. 把 `dag.html` 在浏览器打开，目视审查依赖结构
2. 跑 `validate_dag.py dag.json` 确认无硬性错误
3. 按"批次 1 → 批次 2 → ..." 顺序，将每个任务卡作为独立 Agent prompt 派发
4. 每完成一批，更新进度，再启动下一批
5. 任何 L2 出现"需要等另一个 L2"的情况 → 回头补 L1 契约，重新规划
