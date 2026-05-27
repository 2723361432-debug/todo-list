# 智能待办事项系统 · 部署说明

**版本：** V3.0（React SPA + Node.js + SQLite）  
**更新日期：** 2026-05-26

---

## 1. 环境要求

| 组件 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | **≥ 20 LTS** | 后端运行时，前端构建工具 |
| npm | **≥ 10** | 随 Node.js 20 附带 |
| 操作系统 | Linux / macOS / Windows | 无特殊平台依赖 |
| 浏览器 | Chrome ≥ 90 / Edge ≥ 90 | 生产访问端（NFR-10） |

验证环境版本：
```bash
node -v   # 应显示 v20.x 或更高
npm -v    # 应显示 10.x 或更高
```

---

## 2. 快速启动（5 步）

### 步骤 1：克隆仓库并安装依赖

```bash
# 安装后端依赖
cd backend && npm install

# 安装前端依赖
cd ../frontend && npm install
```

### 步骤 2：配置环境变量

```bash
cp backend/.env.example backend/.env
# 按需编辑 backend/.env（见第 3 节）
```

### 步骤 3：启动后端

```bash
cd backend && npm run dev
# 后端监听 http://localhost:3001
```

> 生产环境使用 `npm start`（不带热重载）。

### 步骤 4：启动前端开发服务器

```bash
cd frontend && npm run dev
# 前端开发服务器监听 http://localhost:5173
```

### 步骤 5：访问应用

打开浏览器，访问 **http://localhost:5173**

---

## 3. 环境变量说明

所有配置集中在 `backend/.env`（勿提交至 Git，已在 `.gitignore` 中排除）。

| 变量名 | 含义 | 是否必填 | 示例值 |
|--------|------|----------|--------|
| `PORT` | 后端监听端口 | 否（默认 3001） | `3001` |
| `FRONTEND_URL` | 前端地址（用于 CORS 白名单） | 否（默认 http://localhost:5173） | `http://localhost:5173` |
| `PIOS_API_BASE_URL` | πOS 平台 API 基础 URL | 否（不配置则用本地数据） | `https://api.pios.example.com` |
| `PIOS_API_TOKEN` | πOS 平台认证 Token | 否（管线集成需要） | `pios_tok_abc123...` |
| `AI_API_BASE_URL` | AI 服务基础 URL | 否（AI 功能需要） | `https://api.openai.com` |
| `AI_API_KEY` | AI 服务 API Key | 否（AI 功能需要） | `sk-...` |
| `AI_MODEL` | 使用的 AI 模型名称 | 否（默认 gpt-4o-mini） | `gpt-4o-mini` |

完整 `.env` 示例：

```dotenv
# Server
PORT=3001
FRONTEND_URL=http://localhost:5173

# πOS Pipeline Integration (optional)
PIOS_API_BASE_URL=https://api.pios.example.com
PIOS_API_TOKEN=pios_tok_your_token_here

# AI Features (optional)
AI_API_BASE_URL=https://api.openai.com
AI_API_KEY=sk-your-key-here
AI_MODEL=gpt-4o-mini
```

---

## 4. 生产构建

### 构建前端静态资源

```bash
cd frontend && npm run build
```

构建产物输出至 `frontend/dist/`，包含：
- `index.html` — 入口 HTML
- `assets/` — 压缩后的 JS / CSS

### 由后端提供静态文件服务

在生产环境中，可通过 Express 提供 `frontend/dist/` 目录下的静态文件，避免单独部署前端服务器：

```js
// 在 backend/src/server.js 中添加（生产模式）
import { join } from 'path';
import { existsSync } from 'fs';

const distPath = join(__dirname, '../../frontend/dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(join(distPath, 'index.html')));
}
```

或使用 Nginx / Caddy 等反向代理将 `frontend/dist/` 作为静态目录，并将 `/api/*` 代理至后端端口 3001。

---

## 5. πOS Token 配置

### 为什么不能写进前端代码

根据开发守则 **G-02**（以及 NFR-07）：前端代码最终会打包成可被任何用户下载的 JS bundle。任何写入前端源码的 Token 都会以明文形式暴露给浏览器访问者。

**正确做法**：Token 只存于后端 `backend/.env` 的 `PIOS_API_TOKEN` 变量，由后端在服务器进程内读取，前端永远不接触明文。

### 配置步骤

```bash
# 编辑后端环境文件
echo "PIOS_API_TOKEN=your_real_token_here" >> backend/.env

# 重启后端以加载新变量
cd backend && npm start
```

### 验证 Token 已配置

调用配置接口，检查 `hasPiosToken` 字段（系统脱敏返回布尔值，不返回明文）：

```bash
curl http://localhost:3001/api/config
```

预期响应示例：

```json
{
  "hasPiosToken": true,
  "hasApiKey": false,
  "aiModel": "gpt-4o-mini"
}
```

- `hasPiosToken: true` — Token 已配置，管线集成可用
- `hasPiosToken: false` — Token 未配置，管线功能将使用本地数据 fallback

> 注意：后端 `getSafeConfig()` 工具函数负责脱敏，确保密钥明文永远不通过 `/api/config` 接口暴露（NFR-07）。

---

## 6. 数据库说明

### 文件位置

SQLite 数据库文件路径：

```
backend/data/todo.db
```

该目录由后端启动时自动创建（`mkdirSync(DB_DIR, { recursive: true })`），无需手动创建。

### WAL 模式

数据库以 **WAL（Write-Ahead Logging）模式**运行（`PRAGMA journal_mode = WAL`），具备以下优势：
- 读写并发：读操作不阻塞写操作
- 崩溃安全：异常退出后自动恢复，不损坏数据库
- 写入性能：批量写入效率高于默认 DELETE 模式

### 备份建议

SQLite 单文件备份非常简单：

```bash
# 方法一：直接复制（WAL 模式下安全）
cp backend/data/todo.db backend/data/todo.db.bak

# 方法二：使用 sqlite3 CLI 热备份（推荐，保证一致性）
sqlite3 backend/data/todo.db ".backup backend/data/todo.db.bak"

# 定期备份示例（cron，每天凌晨 2 点）
0 2 * * * sqlite3 /path/to/backend/data/todo.db ".backup /path/to/backups/todo-$(date +\%F).db"
```

---

## 7. 常见问题

### 端口冲突

**现象：** 启动后端时提示 `EADDRINUSE: address already in use :::3001`

**处理：**

```bash
# 查找占用 3001 端口的进程
lsof -i :3001       # Linux / macOS
netstat -ano | findstr :3001  # Windows

# 终止进程（替换 PID）
kill -9 <PID>       # Linux / macOS
taskkill /F /PID <PID>  # Windows

# 或修改 backend/.env 中的 PORT，换用其他端口
PORT=3002
```

---

### 数据库锁定（Database is locked）

**现象：** 日志出现 `SqliteError: database is locked`

**说明：** 系统已配置 `busy_timeout = 5000ms`（better-sqlite3 默认），大多数并发场景无需手动处理。

**极少数情况下（如进程异常终止）：**

```bash
# 检查是否存在 WAL 临时文件
ls backend/data/todo.db-wal backend/data/todo.db-shm

# 正常重启后端即可：WAL 文件会自动 checkpoint 并清理
cd backend && npm start
```

若问题持续，使用 sqlite3 CLI 手动 checkpoint：

```bash
sqlite3 backend/data/todo.db "PRAGMA wal_checkpoint(FULL);"
```

---

### 语音识别不可用

**现象：** 语音输入按钮灰色或无响应

**原因：** Web Speech API 要求**安全上下文（Secure Context）**，即：
- `localhost`（开发环境，浏览器豁免）
- `https://` 域名（生产环境）

HTTP 生产部署（非 localhost）下语音 API 不可用，这是浏览器安全限制，与应用代码无关。

**解决方案：** 生产环境必须通过 HTTPS 访问，可使用：
- Let's Encrypt + Nginx/Caddy（免费 TLS）
- Cloudflare Tunnel（无需公网 IP）

**Firefox 桌面说明：** 语音识别按钮在 Firefox 桌面上自动隐藏（NFR-08 设计行为），Firefox 不支持 Web Speech API。

---

*部署说明 V1.0 — 智能待办事项系统 V3.0 — 2026-05-26*
