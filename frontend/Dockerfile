# ── Stage 1: Build React frontend ─────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Run FastAPI backend serving React build ───────────────────────
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /workspace

# Copy backend source
COPY backend/ ./backend/

# Copy built React app
COPY --from=builder /app/frontend/dist ./frontend/dist/

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]