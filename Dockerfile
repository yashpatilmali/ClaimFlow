# Multi-stage production Dockerfile for ClaimFlow AI
# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci || npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend & Final Runtime
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir greenlet langgraph-checkpoint-sqlite

COPY . .
# Copy frontend production build from Stage 1
COPY --from=frontend-builder /build/dist /app/frontend/dist

# Auto-generate specimen policies and train ML model
RUN python sample_data/generate_samples.py && python -m app.ml.train_fraud_model

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
