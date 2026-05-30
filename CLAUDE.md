# CLAUDE.md — ai-playground

## Overview

**Repository:** [stepanhampl/ai-playground](https://github.com/stepanhampl/ai-playground)
**Local path:** `/root/ai-playground` (also `~/ai-playground`)
**Purpose:** AI chat playground — FastAPI backend with OpenAI/Anthropic LLM integration + vanilla JS frontend

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python), SQLite, uvicorn |
| Frontend | Vanilla JS (ESM), Vite, jsdom |
| Testing | Vitest (unit), Playwright (E2E) |
| Container | Docker Compose |
| Auth | GitHub CLI (`gh`) |

---

## Golden Rules

### Git Discipline — NEVER push to main

**Always:**
1. Create a branch from current `main`
2. Commit your work
3. Open a Pull Request
4. Ask for review before merging

```bash
git checkout main && git pull
git checkout -b <type>/<issue-id>-<short-description>
# work, commit
git push -u origin <branch>
gh pr create --fill
# ... review ...
gh pr merge --squash
```

Branch naming: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`, `hotfix/`

**No exceptions.** This applies to every repo (ai-playground, stackattack-web, etc.).

### Test-Driven Development — TDD

For any coding task, follow the RED-GREEN-REFACTOR cycle:

1. **RED** — Write a failing test first. Watch it fail.
2. **GREEN** — Write minimal code to make it pass. Nothing more.
3. **REFACTOR** — Clean up while tests stay green.

```python
# RED: test fails because feature doesn't exist
# GREEN: minimal code, even hardcoded values OK
# REFACTOR: remove duplication, improve names
```

If a test passes immediately on first run, you're testing existing behavior — fix the test.

### Type Checking

Run mypy from **project root** with `--explicit-package-bases`:

```bash
cd ~/ai-playground && mypy backend --explicit-package-bases --strict
```

Running from inside `backend/` fails to resolve imports.

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
│   ├── src/api/index.js    # Canonical API module (ESM) — use this for new tests
│   ├── tests/
│   │   ├── api.test.js     # Vitest unit tests
│   │   └── e2e/            # Playwright E2E specs + helpers/
│   ├── package.json
│   ├── vitest.config.js    # jsdom, globals: true
│   └── playwright.config.ts # baseURL: http://0.0.0.0:8000
├── docker-compose.yml      # Two services: app + frontend
├── workspace/              # Volume-mounted working directory (file tools operate here)
└── .env                    # API keys
```

### Backend Path in Container

Inside Docker: `/app/backend/`
`app.py` does `sys.path.insert(0, "/app")` so `from backend.config import ...` works.

### Frontend Static Files

Served from `/app/frontend/static/` via FastAPI `StaticFiles` mount.

---

## API Routes

All routes are under `/api/`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/message` | Send message, receive AI response |
| GET | `/api/chats` | List all chats |
| POST | `/api/chats/{id}/restore` | Restore a chat's messages |
| DELETE | `/api/chats/{id}` | Delete a chat |
| POST | `/api/reset` | Reset conversation state |
| POST | `/api/clear-workspace` | Clear workspace directory |

---

## Frontend API Module

**Canonical module:** `frontend/src/api/index.js` (ESM)

```js
apiSendMessage(content)      // POST /api/message → {content, tool_calls}
apiListChats()               // GET /api/chats → {chats: [...]}
apiRestoreChat(id)           // POST /api/chats/:id/restore → {messages} | null
apiDeleteChat(id)            // DELETE /api/chats/:id
apiReset()                   // POST /api/reset
apiClearWorkspace()          // POST /api/clear-workspace
```

Legacy `frontend/static/js/api.js` is older — prefer `src/api/index.js` for new tests.

---

## Running the App

### Full stack (Docker Compose)

```bash
cd ~/ai-playground
docker compose up --build
# App at http://localhost:8000
docker compose down
```

### Backend only (fast iteration)

```bash
cd ~/ai-playground
export OPENAI_API_KEY=...
export ANTHROPIC_API_KEY=...
cd backend && uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend dev server (Vite)

```bash
cd ~/ai-playground/frontend && npm install && npm run dev
```

---

## Testing

### Vitest Unit Tests

```bash
cd ~/ai-playground/frontend && npx vitest run
# or watch mode
npx vitest
```

**Key patterns:**
```js
// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data, ok = true) {
  return { ok, json: () => Promise.resolve(data) };
}

// Reset before each test
beforeEach(async () => {
  mockFetch.mockReset();
  vi.resetModules();  // force fresh module import
});

// Dynamic import to bypass module caching
const { apiSendMessage } = await import('../src/api/index.js');
```

### Playwright E2E Tests

```bash
cd ~/ai-playground/frontend
npm install
npx playwright install chromium
docker compose -f ../docker-compose.yml up --build -d
sleep 5
npx playwright test
docker compose -f ../docker-compose.yml down
```

Or use the wrapper script at repo root:
```bash
./run-e2e-test.sh
```

**Important:** `baseURL` must be `http://0.0.0.0:8000` — docker port mapping + server binds to `0.0.0.0`.

**E2E helpers convention:** Reusable utilities (selectors, navigation, auth) go in `frontend/tests/e2e/helpers/*.ts`. Import them in specs — don't duplicate logic across test files.

---

## Type Checking (Python)

### Basic

```bash
cd ~/ai-playground && mypy backend --explicit-package-bases
```

### Strict mode

```bash
cd ~/ai-playground && mypy backend --explicit-package-bases --strict
```

### Common `--strict` errors and fixes

**`run()` method type incompatible with parent `Tool`:**
```python
# WRONG — incompatible signature
def run(self, file_path: str, return_type: str) -> dict:

# RIGHT — matches parent with **kwargs
def run(self, **kwargs) -> dict:
    file_path: str = kwargs["file_path"]
    return_type: str = kwargs["return_type"]
```

**`list[Tool]` vs `list[type[Tool]]`:**
```python
# WRONG — classes not instances
ALL_TOOLS: list[Tool] = [Calculator, CreateFile, ...]

# RIGHT — list of class types
ALL_TOOLS: list[type[Tool]] = [Calculator, CreateFile, EditFileByDiff, ReadFile]
# Instantiate with: [ToolClass() for ToolClass in ALL_TOOLS]
```

**`int | None` at call sites:**
```python
# Type narrows to int | None, not int
state.current_chat_id = chats_repo.create(...)

# Fix: assert before use
assert state.current_chat_id is not None
messages_repo.save_msg(state.current_chat_id, ...)
```

**Missing generic type arguments:**
```python
# WRONG
messages: list[dict] = []

# RIGHT — always provide type parameters
messages: list[dict[str, Any]] = []
```

**sqlite3.Row not matching `dict[str, Any]`:**
```python
# WRONG — sqlite3.Row is not dict
return row if row else None

# RIGHT — explicitly convert
return dict(row) if row else None
```

---

## Key Patterns to Remember

1. **Backend path in container:** `/app/backend/` — `sys.path.insert(0, "/app")` in `app.py`
2. **Frontend static files:** Served from `/app/frontend/static/` via FastAPI `StaticFiles` mount
3. **Workspace volume:** `./workspace:/workspace` — file tools operate here
4. **API module is ESM:** `frontend/src/api/index.js` uses `export async function`
5. **Vitest mocking:** `vi.resetModules()` + dynamic `import()` for fresh module state per test
6. **Playwright baseURL:** Must be `http://0.0.0.0:8000` (docker port mapping), not `localhost:8000`
7. **Two docker services:** `app` (backend-only) and `frontend` (full stack) — `frontend` exposes port 8000

---

## Common Commands

```bash
# Clone
gh repo clone stepanhampl/ai-playground ~/ai-playground

# Type check
cd ~/ai-playground && mypy backend --explicit-package-bases --strict

# Run vitest
cd ~/ai-playground/frontend && npx vitest run

# Run E2E
./run-e2e-test.sh

# Docker compose
docker compose -f ~/ai-playground/docker-compose.yml up --build -d
docker compose -f ~/ai-playground/docker-compose.yml down
```

---

## Related Skills

When working in this repo, these skills are loaded automatically:
- `github-dev` — Git branching, PR workflow, never push to main
- `test-driven-development` — TDD RED-GREEN-REFACTOR cycle
- `python-type-correctness` — mypy monorepo patterns, tool class inheritance, type narrowing
- `e2e-testing` — Playwright E2E patterns, docker-compose integration

---

## Workflow Summary

```
1. git checkout main && git pull
2. git checkout -b <branch-name>
3. TDD: write failing test → code → refactor
4. git push -u origin <branch-name>
5. gh pr create --fill
6. All tests pass + self-review done → ask: "Ready to merge?"
```