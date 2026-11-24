# Multi-stage Dockerfile: Backend (Python) + Frontend (Node.js)

# Stage 1: Backend (Python)
FROM python:3.11-slim as backend

WORKDIR /app/backend

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Stage 2: Frontend (Node.js)
FROM node:22-slim as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 3: Runtime (combined)
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend ./backend

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/

# Install frontend prod dependencies
WORKDIR /app/frontend
RUN npm ci --only=production

WORKDIR /app

EXPOSE 3000 5000

CMD ["sh", "-c", "cd backend && python main.py & cd frontend && npm run preview"]
