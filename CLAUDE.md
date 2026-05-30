# CLAUDE.md — ai-playground

## Overview

**Repository:** [stepanhampl/ai-playground](https://github.com/stepanhampl/ai-playground)
**Local path:** `/root/ai-playground`
**Purpose:** AI chat playground — FastAPI backend with OpenAI/Anthropic LLM + vanilla JS frontend

**You are used by a human developer.** You do NOT commit, push, or create PRs. You run tests to verify work the developer has done. Follow their instructions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python), SQLite, uvicorn |
| Frontend | Vanilla JS (ESM), Vite, jsdom |
| Testing | Vitest (unit), Playwright (E2E) |
| Container | Docker Compose |
| Auth | GitHub CLI (`gh`) |

---

## Project Structure

```
ai-playground/
├── backend/
│   ├── app.py              # FastAPI entry point; mounts routes, serves index.html
│   ├── config.py           # OPENAI_API_KEY, ANTHROPIC_API_KEY from env
│   ├── database.py         # SQLite init via init_db()
│   ├── state.py            # Mutable in-memory state (messages, current_chat_id)
│   ├── llm.py              # LLM calls (OpenAI + Anthropic)
│   ├── exceptions/         # Custom exception classes (InvalidToolCall)
│   ├── repositories/       # Data access (chats.py, messages.py)
│   ├── routes/             # FastAPI routers (messages, chats, workspace)
│   └── toolkit/            # Tool classes (Tool base, all_tools.py)
├── frontend/
│   ├── index.html          # SPA shell
│   ├── static/css/style.css
│   ├── static/js/          # Legacy JS (main.js, api.js, sidebar.js, ...)
│   ├── src/api/index.js    # Canonical API module (ESM)
│   ├── tests/
│   │   ├── api.test.js     # Vitest unit tests
│   │   └── e2e/            # Playwright E2E specs + helpers/
│   ├── package.json
│   ├── vitest.config.js    # jsdom, globals: true
│   └── playwright.config.ts # baseURL: http://0.0.0.0:8000
├── docker-compose.yml      # Two services: app + frontend
├── workspace/              # Volume-mounted working directory (file tools operate here)
├── run-e2e-test.sh         # E2E wrapper script
└── .env                    # API keys
```

---

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/message` | Send message, receive AI response |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats/{id}/restore` | Restore a chat's messages |
| DELETE | `/api/chats/{id}` | Delete a chat |
| POST | `/api/reset` | Reset conversation state |
| POST | `/api/clear-workspace` | Clear workspace directory |

---

## Running the App

### Full stack (Docker Compose)

```bash
cd /root/ai-playground
docker compose up --build
# App at http://localhost:8000
docker compose down
```

### Backend only

```bash
cd /root/ai-playground
export OPENAI_API_KEY=*** ANTHROPIC_API_KEY=*** backend && uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend dev server (Vite)

```bash
cd /root/ai-playground/frontend && npm install && npm run dev
```

---

## Testing — Always Run ALL Tests

**Never run individual tests. Always run the full suite in this order:**

### 1. Type check (Python)

```bash
cd /root/ai-playground && mypy backend --explicit-package-bases --strict
```

### 2. Vitest unit tests

```bash
cd /root/ai-playground/frontend && npx vitest run
```

### 3. Playwright E2E tests — ALWAYS use `run-e2e-test.sh`

```bash
cd /root/ai-playground && ./run-e2e-test.sh
```

**Never** run individual E2E specs. **Never** run `npx playwright test` directly. Always use the wrapper script.

---

## Key Patterns

1. **Backend path in container:** `/app/backend/` — `sys.path.insert(0, "/app")` in `app.py`
2. **Frontend static files:** Served from `/app/frontend/static/` via FastAPI `StaticFiles` mount
3. **Workspace volume:** `./workspace:/workspace`
4. **API module is ESM:** `frontend/src/api/index.js`
5. **Vitest mocking:** `vi.resetModules()` + dynamic `import()` bypasses module caching
6. **Two docker services:** `app` (backend-only) and `frontend` (full stack) — `frontend` exposes port 8000
7. **Playwright baseURL:** Must be `http://0.0.0.0:8000` (docker port mapping), not `localhost:8000`