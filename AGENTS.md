

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

