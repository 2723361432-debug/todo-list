# 智能待办事项系统 · 任务工作完成指南 & 验收标准

> 版本：V1.0 | 日期：2026-05-26  
> 技术栈：React 19 + Vite · Node.js 20 + Express 4 · SQLite（better-sqlite3）  
> 开发守则：参见 `/workspace/开发守则.md`（G-01~G-08，T-01，E-01~E-09）  
> 规划来源：`/workspace/dev-plan/dag.json`（22 任务 / 6 批次）

---

## 一、当前代码库状态（执行前基线）

| 模块 | 状态 | 说明 |
|------|------|------|
| `backend/src/routes/tasks.js` | ✅ 已存在 | 使用 TRS 数据模型（`name` 字段，14 列）|
| `backend/src/routes/ai.js` | ✅ 已存在 | AI 路由（SRS 规划范围外，保留现有实现）|
| `backend/src/routes/pipelines.js` | ✅ 已存在 | 含 SSE 推送 |
| `backend/src/routes/config.js` | ✅ 已存在 | 配置读写 |
| `backend/src/routes/pipeline-configs.js` | ❌ 缺失 | 需新建 |
| `backend/src/routes/recommendations.js` | ❌ 缺失 | 需新建 |
| `frontend/src/components/VoiceButton` | ❌ 缺失 | 需新建 |
| `frontend/src/components/PipelineTriggerModal` | ❌ 缺失 | 需新建 |
| `frontend/src/hooks/usePipelineSSE.js` | ✅ 已存在 | 需验证是否完整 |
| Git Remote | ❌ 未配置 | **执行前需补充远端仓库地址** |

> ⚠️ **数据模型差异说明**：现有 db.js 使用 TRS 模型（`name`、14 字段）。开发规划以 SRS 修订版为准（`title`、6 字段）。  
> 执行方针：**保留现有字段，新增 SRS 要求字段，向下兼容**，不做破坏性迁移。

---

## 二、阶段一：开发执行

### 2.1 执行原则

- 严格按 DAG 批次顺序执行；同一批次内所有任务**同时并发启动**
- 每个 Agent 只写 task-card 中"你拥有的文件"清单内的路径
- 遵守开发守则 G-01~G-08（禁止前端直调外部 API、禁止硬编码密钥等）
- 每完成一个任务立即提交代码（见 2.4 提交规范）

### 2.2 Agent 批次派发计划

#### 批次 1（串行，等完成再开批次 2）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-scaffold | `L0-001` | 确认/补全 monorepo 目录结构、`.env.example`、共享类型文件 |

#### 批次 2（2 路并发）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-schema | `L1-001` | 确认/修复 db.js 5 张表 DDL（WAL 模式、busy_timeout=5000）|
| agent-types | `L1-002` | 创建 `shared/types.js` + `docs/api-contract.md`（13 个端点 Schema）|

#### 批次 3（最多 7 路并发）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-mock | `L1-003` | 创建 `backend/mock-server.js`（所有端点 stub，port 3001）|
| agent-appctx | `L1-004` | 完善 AppContext.jsx（全部 action 类型）+ api.js（错误处理）|
| agent-task-svc | `L2-001` | 完善任务 CRUD 路由（title 字段兼容、pipeline_id 关联）|
| agent-pconfig | `L2-002` | 新建 pipeline-configs 路由 + service + pipeline_stats UPSERT |
| agent-sse | `L2-003` | 完善管线触发 + SSE 连接池（heartbeat 30s，data push 5s）|
| agent-recommend | `L2-004` | 新建 recommendations 路由 + SQL 统计服务（7 天/≥3 次）|
| agent-cfg-svc | `L2-005` | 完善 config 路由（πOS Token 脱敏、轮询开关持久化）|

#### 批次 4（最多 7 路并发）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-tasklist | `L2-006` | 完善 TaskListPanel + TaskItem（四态、内联编辑、删除确认）|
| agent-voice | `L2-007` | 新建 VoiceButton + PipelineTriggerModal（含 useSpeechRecognition）|
| agent-psse | `L2-008` | 确认/完善 usePipelineSSE hook（指数退避重连）|
| agent-cpanel | `L2-009` | 完善 ConfigPanel（管线增删 + Token 说明）|
| agent-rpanel | `L2-010` | 完善 RecommendationPanel（推荐卡 + 反馈）|
| agent-shell | `L2-011` | 完善 App.jsx（768px 响应式 + Toast + ErrorBanner）|
| agent-be-int | `L3-001` | 挂载所有路由到 server.js + 集成测试（SQLite in-memory）|

#### 批次 5（串行）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-bridge | `L3-002` | 替换 mock URL → 真实后端，联调主页面全链路 |

#### 批次 6（4 路并发）

| Agent | 任务卡 | 工作内容 |
|-------|--------|----------|
| agent-sse-e2e | `L3-003` | SSE 全链路联调，采样 20 次验证 NFR-01（P95 ≤60s）|
| agent-unittest | `L4-001` | 后端 jest + supertest 单测 + 前端 vitest 组件测 |
| agent-nfr | `L4-002` | 逐项验证 NFR-01~12，输出 `docs/nfr-validation-report.md` |
| agent-docs | `L4-003` | 完善 README（5 步启动）+ `docs/deployment.md` |

### 2.3 任务卡位置

```
/workspace/dev-plan/task-cards/
├── L0-001-仓库脚手架-Repo-Scaffold.md
├── L1-001-SQLite-Schema-db-js-初始化器.md
├── ... (22 张，每张含完整验收标准和文件归属)
```

### 2.4 代码提交规范

每完成一个 DAG 任务节点，执行以下步骤：

```bash
# 1. 暂存该任务相关文件（精确文件名，不用 git add -A）
git add <task-card 中 files_owned 列出的文件>

# 2. 提交（消息格式：[层级-编号] 任务标题）
git commit -m "[L2-007] 新建 VoiceButton + PipelineTriggerModal + useSpeechRecognition"

# 3. 推送（需先配置远端仓库）
git push origin main   # 替换为实际分支名
```

> ⚠️ **前置操作**：执行前需运行 `git remote add origin <仓库地址>`  
> 暂不知仓库地址时，先本地提交，统一 push。

---

## 三、阶段二：测试用例创建与审查

### 3.1 测试用例框架（按功能模块）

测试用例在 `L4-001` 阶段由 agent-unittest 生成，并由以下 5 个测试模块覆盖：

| 模块 | 覆盖范围 | 测试类型 |
|------|----------|----------|
| M1 任务管理 | FR-01/02/03/04/05/06 | 前端 UI + 后端接口 |
| M2 语音录入 | FR-08/09/10 | 前端 UI（浏览器环境）|
| M3 管线集成 | FR-10/11/12/13/14/15/16 | 后端接口 + SSE |
| M4 推荐系统 | FR-17/18/19 | 后端接口（SQL 逻辑）|
| M5 配置管理 | FR-11/15 + NFR-07 | 前端 UI + 后端接口 |

### 3.2 测试用例审查标准

审查由独立 agent（不参与开发的 agent）执行，检查以下项：

- [ ] 每条用例包含：前提条件 / 操作步骤 / 预期结果 / 实际结果 / 截图要求
- [ ] 覆盖了所有 FR-01~FR-19 的验收口径
- [ ] 覆盖了边界场景（空文本、超长文本、断网、Firefox）
- [ ] NFR 用例包含可量化的测量方法
- [ ] 无重复用例

---

## 四、阶段三：功能测试执行（5 个测试 Agent）

### 4.1 测试 Agent 分工

| Agent | 负责模块 | 测试类型 | 截图要求 |
|-------|----------|----------|----------|
| test-agent-1 | M1 任务管理（CRUD + 筛选）| Playwright E2E | 每步截图 |
| test-agent-2 | M2 语音录入（VoiceButton）| Playwright E2E + 手动 | 录音状态截图 |
| test-agent-3 | M3 管线集成（触发 + SSE）| Playwright + curl | SSE 响应截图 |
| test-agent-4 | M4 推荐系统 + M5 配置管理 | Playwright E2E | 推荐卡截图 |
| test-agent-5 | NFR 专项（性能/移动端/安全）| DevTools + 脚本 | Network 截图 |

### 4.2 截图留存规范

```
/workspace/test-results/
├── screenshots/
│   ├── M1-task-crud/
│   │   ├── 01-add-task-empty-input-blocked.png
│   │   ├── 02-add-task-success.png
│   │   └── ...
│   ├── M2-voice/
│   ├── M3-pipeline/
│   ├── M4-recommendation/
│   └── M5-config/
└── test-report.md   ← 测试结果清单
```

截图命名规则：`<步骤序号>-<操作描述>-<预期结果>.png`

### 4.3 测试结果清单格式（`test-report.md`）

```markdown
| 用例ID | 模块 | 操作描述 | 预期结果 | 实际结果 | 截图 | 状态 |
|--------|------|----------|----------|----------|------|------|
| TC-M1-001 | 任务管理 | 提交空文本 | 输入框抖动，拒绝提交 | ... | screenshots/M1/01-... | ✅/❌ |
```

---

## 五、阶段四：缺陷修复（5 个修复 Agent 并行）

### 5.1 Bug 分配规则

按**功能模块**分配，与测试 Agent 分工对应：

| 修复 Agent | 负责模块 | Bug 来源 |
|------------|----------|----------|
| fix-agent-1 | 任务管理（CRUD/筛选/编辑）| test-agent-1 报告的 ❌ |
| fix-agent-2 | 语音录入 + 管线触发弹窗 | test-agent-2 报告的 ❌ |
| fix-agent-3 | 管线集成 + SSE 推送 | test-agent-3 报告的 ❌ |
| fix-agent-4 | 推荐系统 + 配置管理 | test-agent-4 报告的 ❌ |
| fix-agent-5 | NFR 专项（性能/安全/移动端）| test-agent-5 报告的 ❌ |

### 5.2 修复提交规范

```bash
git add <修改的文件>
git commit -m "fix: [TC-M1-003] 空文本提交未触发抖动动效"
git push origin main
```

---

## 六、阶段五：回归测试

### 6.1 回归范围

修复完成后，各修复 Agent 对应模块重跑**完整测试用例集**（不仅是失败用例）。

### 6.2 回归通过标准

| 级别 | 要求 |
|------|------|
| P0 功能（FR-01~FR-09）| 通过率 **100%** |
| P1 功能（FR-10~FR-19）| 通过率 **≥95%** |
| NFR 专项 | NFR-01/04/07/08 必须 100% 通过 |
| 无新引入 Bug | 回归不得新增 ❌ 用例 |

---

## 七、验收标准（整体）

### 7.1 功能验收标准

| 验收项 | 标准 | 验证方式 |
|--------|------|----------|
| FR-01 任务添加 | 非空→列表出现+输入框清空；空文本→拒绝（抖动动效）| Playwright TC-M1-001/002 |
| FR-02 任务删除 | 点击→弹确认框；确认→永久删除；取消→保留 | Playwright TC-M1-003/004 |
| FR-03 完成标记 | 复选框双向切换；刷新后状态保留 | Playwright TC-M1-005/006 |
| FR-04 内联编辑 | 双击→编辑框；回车/失焦→保存；Esc/空→恢复原值 | Playwright TC-M1-007~010 |
| FR-05 状态筛选 | 全部/进行中/已完成三档；切换不丢数据 | Playwright TC-M1-011~013 |
| FR-06 SQLite 持久化 | 刷新/重开后数据完整保留 | GET /api/tasks 核对 |
| FR-07 响应式布局 | 768px 断点；375px 无溢出；按钮 ≥44×44px | DevTools 截图 |
| FR-08 语音按钮 | Firefox 桌面：DOM 中**不存在**该元素 | Firefox DevTools 验证 |
| FR-09 语音识别结果 | 识别结果填入输入框，**不**自动提交 | Playwright TC-M2-003 |
| FR-10 语音触发管线 | 识别→弹管线列表→二次确认→触发 | Playwright TC-M2-004 |
| FR-11 管线配置页 | 增删管线配置；Token 存后端 .env | Playwright TC-M5-001~003 |
| FR-13 管线状态同步 | P95 ≤60s 内状态更新 | 脚本采样 20 次 |
| FR-14 状态映射 | completed→任务完成；failed→红色标签 | Playwright TC-M3-005/006 |
| FR-17 推荐卡展示 | 7 天内 ≥3 次触发→侧边栏出现推荐卡；≤1 张 | TC-M4-001 |
| FR-18 推荐反馈 | 标记无用→7 天内不再出现 | TC-M4-002 |
| FR-19 无推荐提示 | 无数据时显示"数据积累中，暂无推荐" | TC-M4-003 |

### 7.2 非功能验收标准（NFR）

| NFR | 指标 | 验证方法 | 通过条件 |
|-----|------|----------|----------|
| NFR-01 | 管线状态同步延迟 | 脚本采样 20 次测量触发→前端更新时间 | P95 ≤ 60s |
| NFR-02 | 推荐准确性 | 构造满足/不满足条件各 10 组数据 | 100% 正确触发/不触发 |
| NFR-03 | 初始加载时间 | Chrome DevTools DOMContentLoaded | ≤ 3s（有线网络，生产构建）|
| NFR-04 | SQLite 写入可靠性 | 写入后 GET /api/tasks 核对 | 刷新后 100% 保留 |
| NFR-05 | 500 条渲染性能 | 预置 500 条任务，录制渲染耗时 | ≤ 500ms |
| NFR-06 | API 失败容错 | 断网状态执行所有操作 | 不崩溃不白屏 |
| NFR-07 | Token 安全 | DevTools Network 全量抓包 | πOS Token 不出现在任何响应 |
| NFR-08 | 语音兼容性 | Firefox 桌面查 DOM | `querySelector('[data-voice]')` 返回 null |
| NFR-10 | 浏览器兼容性 | Chrome ≥90 / Edge ≥90 / Safari ≥14 各执行核心路径 | 无错误 |
| NFR-11 | 可用性 | 停后端进程操作前端 | 友好提示，不白屏 |
| NFR-12 | 部署便捷性 | 按 README 步骤执行 | 5 步内完成本地启动 |

### 7.3 代码规范验收

| 规则 | 验证方式 | 通过条件 |
|------|----------|----------|
| G-01 前端不直调外部 API | grep 全仓库 `fetch.*openai\|fetch.*pios` | 前端代码中无匹配 |
| G-02 前端无硬编码密钥 | grep 全仓库 `API_KEY\|Bearer ` in frontend/ | 无匹配 |
| G-04 推荐门控 | 代码审查 recommendationService.js | 有 7 天/≥3 次条件判断 |
| G-05 管线创建原子性 | 代码审查 pipelineConfigService.js | createPipeline 成功后才写 keywordRules |
| `.env` 不入库 | git ls-files \| grep .env | 无 `.env` 文件（`.env.example` 允许）|

### 7.4 Git 提交验收

| 项目 | 要求 |
|------|------|
| 每个 DAG 任务节点 | 至少 1 条对应提交记录 |
| 提交消息格式 | `[L层-编号] 描述` 或 `fix: [TC-Mx-xxx] 描述` |
| 不得提交 | `.env`、`node_modules/`、`*.db` 文件 |
| 推送 | 所有本地提交推送到远端仓库对应分支 |

---

## 八、待补充信息（执行前确认）

在启动阶段一之前，请提供：

| 项目 | 状态 | 说明 |
|------|------|------|
| Git 远端仓库地址 | ❌ **待补充** | 用于 `git remote add origin <url>` |
| 推送分支名 | ❌ **待确认** | main / master / dev？ |
| πOS Token（测试用）| ⚠️ 可选 | 管线触发测试需要，无则用 mock stub |

---

## 九、产物清单（完成后应存在）

```
/workspace/
├── backend/src/                    # 完整后端代码
├── frontend/src/                   # 完整前端代码
├── shared/types.js                 # 前后端共享类型
├── docs/
│   ├── api-contract.md             # API 契约文档
│   ├── nfr-validation-report.md    # NFR 验证报告
│   └── deployment.md               # 部署说明
├── test-results/
│   ├── screenshots/                # 分模块截图（每步操作）
│   └── test-report.md              # 测试结果清单
├── dev-plan/task-cards/            # 22 张 Agent 任务卡
└── README.md                       # 5 步内本地启动说明
```
