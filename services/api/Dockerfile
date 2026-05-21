# =========================================================================
# NHPMBR API — multi-stage Dockerfile
# Targets:
#   - dev:   hot-reload, source-mounted in compose
#   - build: install + compile bytecode
#   - prod:  minimal runtime, non-root, healthcheck
# =========================================================================

ARG PYTHON_VERSION=3.12

# ---------- base ----------
FROM python:${PYTHON_VERSION}-slim-bookworm AS base
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    PATH=/opt/venv/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl libpq5 \
    && rm -rf /var/lib/apt/lists/*

# ---------- build ----------
FROM base AS build
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir uv==0.4.20

WORKDIR /app
COPY pyproject.toml README.md ./
RUN uv venv /opt/venv && uv pip install --python /opt/venv/bin/python -e ".[dev]"
COPY . .

# ---------- dev ----------
FROM build AS dev
ENV APP_ENV=dev
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ---------- prod ----------
FROM base AS prod
ENV APP_ENV=prod
WORKDIR /app

COPY --from=build /opt/venv /opt/venv
COPY --from=build /app /app

RUN groupadd --gid 10001 nhpmbr \
    && useradd --uid 10001 --gid nhpmbr --shell /sbin/nologin --create-home nhpmbr \
    && chown -R nhpmbr:nhpmbr /app
USER nhpmbr

EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/healthz || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
