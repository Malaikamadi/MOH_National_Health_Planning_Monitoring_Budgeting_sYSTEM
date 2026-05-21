# =========================================================================
# NHPMBR — Developer Makefile
# Run `make help` to see all available targets.
# =========================================================================

SHELL := /bin/bash
.DEFAULT_GOAL := help

COMPOSE        := docker compose -f infra/docker-compose.dev.yml --env-file .env
API_DIR        := services/api
WEB_DIR        := apps/web

# ---------- Meta ----------

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: bootstrap
bootstrap: ## One-shot: create .env, build images, start stack, run migrations, seed
	@test -f .env || cp .env.example .env
	$(MAKE) up
	$(MAKE) migrate
	@echo ""
	@echo "✅ Bootstrap complete."
	@echo "   API:      http://localhost:8000/docs"
	@echo "   Web:      cd $(WEB_DIR) && pnpm dev"
	@echo "   Keycloak: http://localhost:8080 (admin / admin)"
	@echo "   MinIO:    http://localhost:9001"

# ---------- Local stack ----------

.PHONY: up
up: ## Start dev stack (postgres, redis, minio, keycloak, api)
	$(COMPOSE) up -d --build
	$(COMPOSE) run --rm keycloak-bootstrap
	@echo "Stack up. View logs with: make logs"

.PHONY: keycloak-bootstrap
keycloak-bootstrap: ## Set dev NHPMBR Keycloak user/password (after Keycloak is up)
	$(COMPOSE) run --rm keycloak-bootstrap

.PHONY: down
down: ## Stop dev stack
	$(COMPOSE) down

.PHONY: nuke
nuke: ## Stop dev stack AND delete all volumes (destructive)
	$(COMPOSE) down -v
	@echo "💥 All volumes deleted."

.PHONY: keycloak-reset
keycloak-reset: ## Delete Keycloak dev volume and recreate (re-imports realm; fixes stale SSL / OIDC discovery)
	$(COMPOSE) stop keycloak
	-docker rm -f nhpmbr-keycloak 2>/dev/null
	-docker volume rm nhpmbr-dev_keycloak-data 2>/dev/null
	$(COMPOSE) up -d keycloak
	@echo "Keycloak recreated. Running bootstrap user (wait if Keycloak is still starting)…"
	$(COMPOSE) run --rm keycloak-bootstrap
	@echo "Check: curl http://localhost:8080/realms/nhpmbr/.well-known/openid-configuration"

.PHONY: logs
logs: ## Tail dev stack logs
	$(COMPOSE) logs -f --tail=200

.PHONY: ps
ps: ## Show running dev containers
	$(COMPOSE) ps

# ---------- Backend (FastAPI) ----------

.PHONY: api-shell
api-shell: ## Open a shell in the API container
	$(COMPOSE) exec api bash

.PHONY: api-install
api-install: ## Install Python dependencies locally (outside docker)
	cd $(API_DIR) && uv sync

.PHONY: api-run
api-run: ## Run API locally (outside docker, on host)
	cd $(API_DIR) && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: api-test
api-test: ## Run backend tests
	$(COMPOSE) exec api pytest -q

.PHONY: api-lint
api-lint: ## Lint + format check backend
	$(COMPOSE) exec api ruff check .
	$(COMPOSE) exec api ruff format --check .

.PHONY: api-fmt
api-fmt: ## Auto-format backend
	cd $(API_DIR) && uv run ruff format . && uv run ruff check --fix .

# ---------- Database / migrations ----------

.PHONY: migrate
migrate: ## Apply Alembic migrations
	$(COMPOSE) exec api alembic upgrade head

.PHONY: migration
migration: ## Create a new Alembic revision (use: make migration MSG="add x table")
	$(COMPOSE) exec api alembic revision --autogenerate -m "$(MSG)"

.PHONY: downgrade
downgrade: ## Downgrade one Alembic revision
	$(COMPOSE) exec api alembic downgrade -1

.PHONY: psql
psql: ## Open psql shell to dev DB
	$(COMPOSE) exec postgres psql -U $${POSTGRES_USER:-nhpmbr} -d $${POSTGRES_DB:-nhpmbr}

# ---------- Web (Next.js) ----------

.PHONY: web-install
web-install: ## Install web dependencies
	pnpm -C $(WEB_DIR) install

.PHONY: web-dev
web-dev: ## Run Next.js dev server (host)
	pnpm -C $(WEB_DIR) dev

.PHONY: web-build
web-build: ## Build Next.js for production
	pnpm -C $(WEB_DIR) build

.PHONY: web-lint
web-lint: ## Lint web
	pnpm -C $(WEB_DIR) lint

.PHONY: web-typecheck
web-typecheck: ## Typecheck web
	pnpm -C $(WEB_DIR) typecheck

# ---------- Quality gates (run in CI too) ----------

.PHONY: check
check: api-lint api-test web-lint web-typecheck ## Run all quality gates
