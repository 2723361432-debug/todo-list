

<!-- DEVHUB:RESOURCES BEGIN -->
## 可用基础设施服务（DevHub 自动维护）

本环境挂载的资源服务（Postgres / Redis / MinIO / MQTT 等）由平台实时维护。

**查询方式**（按优先级）：

- 用户问「有哪些可用资源 / 服务 / 基础设施」→ 用 user-prompt-submit hook 每轮回车注入的 `## 可用基础设施服务（DevHub 自动维护）` 表格为准；本段是稳定 disclaimer，**不含实时列表**。
- 需要完整连接凭据（密码 / conn_uri）→ `cat /workspace/.devhub/resources.json`（hook 同步写入的本地 snapshot）。
- 最实时的 ground truth → 调用 MCP 工具 `testhub_list_attached_resources` 直查后端 DB。
- 登记新发现的资源 → MCP 工具 `testhub_add_resource(kind, display_name, endpoint, conn_uri?, credentials_extra?)`，或让用户在 IDE 右下「可用资源」面板手动挂载。

写代码连 DB / Redis / MQ 时，**优先用 hook 注入表里的现成实例**，不要让用户手填连接串；表里没有再追问用户或调 `testhub_add_resource` 登记。
<!-- DEVHUB:RESOURCES END -->

## 硬约束：AI 行为规则（所有 Agent 必须遵守）

### 不得无工具证据地声称事实

在没有对应工具调用输出作为证据时，**禁止**：
- 声称文档有「X 段落 / Y 张表格」（需用 python-docx 等解析后展示结果）
- 声称「后端启动成功」「/health 正常」（需展示实际 npm start / curl 输出）
- 声称「文件已生成」「目录已存在」（需展示 ls / Read 结果）
- 引用具体行号（如「第 539–595 行」）而不展示对应 grep / Read 输出
- 引用文档节号（如「SRS §1.3.1」）而不先读取该节内容

若步骤被截断导致无法展示完整证据，应明确告知用户哪些已验证、哪些需手动核对。

### 多 Agent DAG 工作流任务完成判定

- **文件存在 ≠ 任务完成**：必须收到对应 task-id 的 `<task-notification status="completed">` 才能视为完成
- 整层 Agent（如 Layer 3 全部）无输出时，**先排查原因**，不得擅自代替 Agent 写代码后声称「已修复」
- 声称「将自动合并 / 自动启动下一层」时，必须有实际的监听代码，不得仅在文字描述中承诺

### 批量验证不得以偏概全

声称「所有 N 条规则均合规」「所有 M 处改动均完成」时，必须逐条展示验证步骤，不得仅抽查 1-2 条后外推。
