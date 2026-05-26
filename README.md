# 智能待办事项系统

React 19 + Node.js 20 + SQLite — Todo List with Voice Input & Pipeline Integration.

## Quick Start (5 steps)

1. **Clone & install dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env — set PIOS_API_BASE_URL and PIOS_API_TOKEN if using pipeline integration
   # Set AI_API_BASE_URL and AI_API_KEY if using AI features
   ```

3. **Start backend**
   ```bash
   cd backend && npm run dev
   # Server starts on http://localhost:3001
   ```

4. **Start frontend**
   ```bash
   cd frontend && npm run dev
   # App opens on http://localhost:5173
   ```

5. **Open browser**
   Navigate to http://localhost:5173

## Features

- Task CRUD (add / complete / edit / delete with confirmation)
- Voice input (Web Speech API, zh-CN; hidden on Firefox desktop)
- Pipeline integration with SSE real-time status push
- SQL-based recommendations (7-day / >=3 trigger rule)
- Responsive layout (768px breakpoint, 375px mobile)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List all tasks |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/pipeline-configs | List pipeline configs |
| POST | /api/pipeline-configs | Add pipeline config |
| DELETE | /api/pipeline-configs/:id | Remove pipeline config |
| GET | /api/pipeline/status-stream | SSE status stream |
| GET | /api/recommendations | Get recommendations |
| POST | /api/recommendations/feedback | Submit feedback |
| GET | /api/config | Get app config (tokens masked) |
| PATCH | /api/config | Update app config |

## Tech Stack

- **Frontend**: React 19, Vite 8, CSS Modules
- **Backend**: Node.js 20, Express 4, better-sqlite3 (WAL mode)
- **Testing**: Playwright (Chromium)
