# NHPMBR API

FastAPI modular monolith powering the National Health Planning, Monitoring,
Budgeting & Reporting Platform.

## Project layout

```
services/api/
├── app/
│   ├── core/                # config, db, security, logging, telemetry, errors, middleware
│   ├── modules/             # one folder per bounded context (iam, org, mdm, ...)
│   │   └── <module>/
│   │       ├── models.py    # SQLAlchemy ORM
│   │       ├── schemas.py   # Pydantic DTOs
│   │       ├── repository.py# data access
│   │       ├── service.py   # business logic
│   │       ├── router.py    # HTTP routes
│   │       └── api.py       # *public Python interface for cross-module calls*
│   ├── integrations/        # DHIS2, IFMIS, HRIS, FHIR adapters (Phase 5+)
│   ├── workers/             # Celery tasks (reports, sync, notifications)
│   └── main.py              # FastAPI entry point
├── alembic/                 # database migrations
├── tests/                   # pytest tests
├── Dockerfile               # multi-stage (dev / prod)
└── pyproject.toml
```

## Module boundary rule (enforced in CI)

Cross-module calls go **only through `app.modules.<name>.api`**. No other
module may import from another module's `models`, `repository`, `service`,
or `router`. This is enforced by `import-linter` (see `pyproject.toml`).

## Running locally

From the **repo root**:

```bash
# Bring up postgres + redis + minio + keycloak + api
make up

# Run migrations
make migrate

# Tail logs
make logs

# Open Swagger UI
open http://localhost:8000/docs
```

To work outside Docker (faster reloads):

```bash
cd services/api
uv sync
uv run uvicorn app.main:app --reload
```

## Migrations

```bash
make migration MSG="add foo table"   # create a new revision (autogenerate)
make migrate                          # apply
make downgrade                        # roll back one
```

## Testing

```bash
make api-test           # all tests
pytest -q tests/test_health.py
pytest -m integration   # requires running stack
```

## Linting and types

```bash
make api-lint           # ruff check + format check
make api-fmt            # auto-fix
mypy app                # static type check
lint-imports            # enforce module boundaries
```

## Adding a new module

1. Create `app/modules/<name>/` with the six standard files.
2. Add the schema name to `SCHEMA_LIST` in `alembic/env.py`.
3. Add the module's import to the `import-linter` contracts in `pyproject.toml`.
4. Mount the router in `app/main.py`.
5. Write an Alembic migration creating the schema and tables.
6. Add tests under `tests/<name>/`.
