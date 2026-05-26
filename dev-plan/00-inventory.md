# 00 项目实体清单（Inventory）

> 来源：需求规格说明书_修订.docx (SRS V3.0 修订版) + 产品需求文档.docx (PRD V3.0) + 技术规格设计说明书.docx (TRS V3.0)
>
> **关键差异声明**：修订版 SRS 图表已全部更新为 V3.0 B/S 架构，与原版 V1.0 localStorage 图表完全不同。
> TRS 包含若干超出 SRS 范围的特性（AI 拆解/路由/分析），规划以 SRS 为权威需求，TRS 为技术实现参考。

---

## 1. Features（功能项）

### 第一期（P0 Must Have）

| ID    | 功能名称         | 验收口径（可测）                                              |
|-------|-----------------|-------------------------------------------------------------|
| FR-01 | 任务添加         | 输入非空→任务出现在列表+输入框清空；空文本提交→拦截              |
| FR-02 | 任务删除         | 点击删除→弹确认框；确认→永久移除；取消→保留                     |
| FR-03 | 完成标记切换     | 复选框双向切换 pending↔completed，刷新后保留                   |
| FR-04 | 任务内联编辑     | 双击→编辑框；回车/失焦保存；Esc/空文本→恢复原值               |
| FR-05 | 状态筛选         | 全部/进行中/已完成三档；切换不丢数据                           |
| FR-06 | SQLite 持久化    | 刷新/关闭重开后任务完整保留；GET /api/tasks 与前端展示一致      |
| FR-07 | 响应式移动端布局 | 768px 断点；375px 无溢出；按钮最小点击区域 44×44px            |
| FR-08 | 语音录入按钮     | 长按录音、松开识别；Firefox 桌面不渲染（DOM 中不存在）         |
| FR-09 | 语音识别结果填入 | 识别结果填入输入框，不自动提交；用户可编辑后确认               |
| FR-10 | 语音触发管线     | 识别完成→弹管线列表→二次确认→触发（P1，简化版）               |

### 第二期（P0/P1）

| ID    | 功能名称           | 验收口径                                                    |
|-------|-------------------|-------------------------------------------------------------|
| FR-11 | 管线配置页         | 填写 API baseURL，添加/删除管线条目；Token 存后端 .env        |
| FR-12 | 任务关联管线       | 每条任务可关联一条 Pipeline ID                               |
| FR-13 | 管线状态轮询同步   | 每 30s 轮询；≤60s 内任务状态更新（NFR-01 P95）              |
| FR-14 | 状态映射自动更新   | completed→任务完成；failed→红色"管线失败"标签               |
| FR-15 | 轮询全局开关       | 用户可停止/恢复轮询（P1）                                    |
| FR-16 | 管线触发频率记录   | 每次触发写入 pipeline_stats（trigger_count + last_triggered_at）|
| FR-17 | 推荐卡展示         | 7 天内 ≥3 次触发→侧边栏显示推荐卡；同时最多 1 张             |
| FR-18 | 推荐反馈           | 标记"无用"→7 天内不再出现（suppressUntil）（P1）            |
| FR-19 | 数据积累不足提示   | 无推荐数据时显示"数据积累中，暂无推荐"（P1）                  |

---

## 2. Pages & Flows（页面与流程）

| 页面/面板        | 描述                                                         | 期    |
|-----------------|--------------------------------------------------------------|-------|
| 主页面           | 输入区 + 语音按钮 + 筛选区 + 任务列表（四态：正常/空/加载/错误）| 第一期 |
| 语音交互状态     | 待机→录音中（脉冲动效）→成功/失败                             | 第一期 |
| 管线触发弹窗     | 识别后弹出管线列表 + 二次确认（默认焦点在"取消"）             | 第一期 |
| 配置页（ConfigPanel）| 管线配置、关键词规则、πOS Token 说明                       | 第二期 |
| 推荐面板（侧边栏）| 推荐卡 + 采纳/忽略反馈                                       | 第二期 |

**核心流程**：

- 主流程（第二期完整态）：用户→GET /api/tasks→语音/手动输入→POST /api/tasks→关联管线?→后端 30s 轮询 πOS→状态变更→更新 Task 状态
- 推荐流程：后端 SQL 查询 pipeline_stats（7 天内 ≥3 次）→满足条件→GET /api/recommendations 展示卡片

---

## 3. Modules & Services（模块与服务）

### 后端（Node.js/Express）

| 模块                  | 职责                                              |
|-----------------------|---------------------------------------------------|
| routes/tasks          | GET/POST/PATCH/DELETE /api/tasks                 |
| routes/pipeline-configs| GET/POST/DELETE /api/pipeline-configs           |
| routes/pipelines      | POST /api/pipelines/:id/trigger + SSE 状态推送   |
| routes/recommendations| GET /api/recommendations + POST /feedback        |
| routes/config         | GET/PATCH /api/config（app_config 键值读写）     |
| services/taskService  | 任务 CRUD，pipeline_id 关联                      |
| services/pipelineConfigService | 管线配置 CRUD                          |
| services/piosClient   | πOS API 代理（触发/状态查询，Bearer Token）       |
| services/sseService   | SSE 连接池，EventEmitter 广播管线状态             |
| services/recommendationService | SQL 统计推荐（7天/≥3次），suppressUntil |
| services/configService| app_config UPSERT，Token 安全脱敏                |
| db.js                 | SQLite 初始化，WAL 模式，busy_timeout=5000       |

### 前端（React + Vite）

| 模块                   | 职责                                              |
|------------------------|---------------------------------------------------|
| AppContext + useReducer | 全局状态管理（任务列表、配置、推荐）             |
| TaskListPanel          | 任务列表渲染，筛选/排序（纯前端内存操作）        |
| TaskItem               | 单条任务渲染，内联编辑，完成/删除交互            |
| InputPanel             | 输入框，任务提交，空文本校验                     |
| VoiceButton            | 长按录音，useSpeechRecognition Hook              |
| PipelineTriggerModal   | 管线选择列表，二次确认弹窗                       |
| usePipelineSSE         | EventSource 订阅 SSE，断线重连，状态 dispatch    |
| ConfigPanel            | 管线配置增删，πOS Token 说明，app 设置           |
| RecommendationPanel    | 推荐卡展示，采纳/忽略操作                        |
| App.jsx                | 整体布局，响应式（768px断点），全局错误/Toast    |

---

## 4. Data Entities（核心数据实体）

### SQLite 表（来自 SRS 修订版图表）

**tasks 表**（主表）

| 字段        | 类型    | 约束                            |
|------------|---------|--------------------------------|
| id         | INTEGER | PK AUTO INCREMENT              |
| title      | TEXT    | NOT NULL，最大 200 字符         |
| status     | TEXT    | DEFAULT 'pending'（pending/completed）|
| pipeline_id| TEXT    | NULL（关联 pipeline_configs.pipeline_id）|
| created_at | DATETIME| DEFAULT CURRENT_TIMESTAMP      |
| updated_at | DATETIME| 最近更新时间                    |

**pipeline_configs 表**

| 字段          | 类型    | 约束                    |
|--------------|---------|------------------------|
| id           | INTEGER | PK AUTO INCREMENT      |
| pipeline_id  | TEXT    | UNIQUE NOT NULL        |
| display_name | TEXT    | 用户友好名称            |
| api_base_url | TEXT    | πOS API 端点           |
| created_at   | DATETIME| DEFAULT CURRENT_TIMESTAMP|

**pipeline_stats 表**（第二期）

| 字段              | 类型    | 约束                              |
|------------------|---------|----------------------------------|
| id               | INTEGER | PK AUTO INCREMENT                |
| pipeline_id      | TEXT    | FK pipeline_configs.pipeline_id  |
| trigger_count    | INTEGER | DEFAULT 0                        |
| last_triggered_at| DATETIME| 最近触发时间，无则 NULL           |

**app_config 表**

| 字段       | 类型    | 约束         |
|-----------|---------|-------------|
| key        | TEXT    | PK 配置键   |
| value      | TEXT    | 配置值       |
| updated_at | DATETIME| 最近更新时间 |

**recommendation_feedback 表**（第二期）

| 字段        | 类型    | 约束                              |
|------------|---------|----------------------------------|
| id         | INTEGER | PK AUTO INCREMENT                |
| pipeline_id| TEXT    | FK pipeline_configs.pipeline_id  |
| useful     | BOOLEAN | TRUE/FALSE 用户反馈              |
| created_at | DATETIME| 记录反馈时间（用于计算 7 天抑制期）|

> ⚠️ **SRS vs TRS 差异**：SRS 修订版图表 tasks 表字段为 title（非 name），仅 6 字段，无 priority/category/timeLabel/dueAt/source/executionId/pipelineStatus。TRS 扩展了 14 字段，**规划以 SRS 为准**。

---

## 5. API Surface（端点清单）

| 端点                                  | 方法   | 描述                   | 期     |
|--------------------------------------|--------|------------------------|-------|
| /api/tasks                           | GET    | 获取全量任务列表         | P1    |
| /api/tasks                           | POST   | 创建任务               | P1    |
| /api/tasks/:id                       | PATCH  | 更新任务字段            | P1    |
| /api/tasks/:id                       | DELETE | 删除任务               | P1    |
| /api/pipeline-configs                | GET    | 获取管线配置列表         | P2    |
| /api/pipeline-configs                | POST   | 添加管线配置            | P2    |
| /api/pipeline-configs/:id            | DELETE | 删除管线配置            | P2    |
| /api/pipelines/:id/trigger           | POST   | 触发管线执行            | P1/P2 |
| /api/pipeline/status-stream          | GET    | SSE 长连接，推送状态    | P2    |
| /api/recommendations                 | GET    | 获取推荐列表            | P2    |
| /api/recommendations/feedback        | POST   | 提交推荐反馈（采纳/忽略）| P2    |
| /api/config                          | GET    | 获取全局配置            | P1    |
| /api/config                          | PATCH  | 更新全局配置            | P1    |

---

## 6. Integrations（外部集成）

| 集成               | 类型      | 期    | 说明                                       |
|-------------------|-----------|-------|--------------------------------------------|
| πOS Pipeline API  | REST/HTTP | 第二期 | Bearer Token 存 .env；触发+状态查询         |
| Web Speech API    | 浏览器原生 | 第一期 | SpeechRecognition zh-CN；Firefox 降级隐藏  |

> ⚠️ **TRS 中的 AI（OpenAI-compatible API）不在规划范围内** — SRS §1.3.3 明确列为 OUT OF SCOPE："AI 大模型辅助分析（推荐功能采用规则统计，不接入 LLM API）"

---

## 7. NFRs（非功能需求）

| 编号   | 指标                   | 目标                          | 评估方法                     |
|-------|------------------------|-------------------------------|------------------------------|
| NFR-01| 管线状态同步延迟         | P95 ≤ 60s                    | 测试脚本 20 次样本             |
| NFR-02| 推荐触发准确性           | 7天≥3次→必出现推荐卡；100%     | 测试脚本构造满足/不满足条件    |
| NFR-03| 页面初始加载时间         | ≤ 3s（有线网络，生产构建）     | Chrome DevTools DOMContentLoaded|
| NFR-04| SQLite 写入可靠性        | 刷新后数据 100% 保留           | GET /api/tasks 核对           |
| NFR-05| 任务列表渲染性能         | ≤ 500ms（500条以内）          | 预置 500 条录制耗时            |
| NFR-06| API 请求失败容错         | 不崩溃不白屏                   | 断网状态执行所有操作           |
| NFR-07| πOS Token 安全           | 不出现在任何前端可见位置        | DevTools Network 抓包验证      |
| NFR-08| 语音按钮兼容性           | Firefox 桌面不渲染             | Firefox 验证 DOM 不存在        |
| NFR-10| 浏览器兼容性             | Chrome≥90 / Edge≥90 / Safari≥14 | 各浏览器核心路径测试          |
| NFR-11| 可用性                  | 后端异常时友好提示，不白屏      | 停后端进程验证                 |
| NFR-12| 部署便捷性              | 5 步内本地启动                 | README 验证                   |

---

## 8. 文档差异汇总

| 议题                    | SRS 修订版                  | TRS                          | 规划决策               |
|------------------------|-----------------------------|-----------------------------|------------------------|
| Task 字段名             | `title`，6 字段             | `name`，14 字段             | 以 SRS 为准：`title` + 6字段 |
| AI 拆解/路由/分析        | OUT OF SCOPE                | 核心功能（3个用例）          | **不实现 AI**           |
| 推荐算法                | SQL 统计（7天/≥3次规则）     | N-gram + AI batch           | 以 SRS 为准：纯 SQL 规则 |
| 数据库表结构             | 5 张表                     | 3 张表（tasks/config/recommendations）| 以 SRS 为准：5 张表 |
| 状态推送方式             | 30s 轮询（SRS 文字）         | SSE 推送                    | 采用 SSE（满足 NFR-01，技术改进）|
| 推荐存储                | recommendation_feedback 表  | recommendations 表           | 以 SRS 为准：recommendation_feedback |
