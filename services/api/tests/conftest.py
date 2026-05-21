"""Pytest fixtures shared across all tests.

Two execution modes:

* **Unit** (default) — no database, only pure-Python tests.
* **Integration** — requires the dev docker stack (or any reachable
  Postgres at ``DATABASE_URL``). Mark tests with ``@pytest.mark.integration``.

The fixtures here keep both modes ergonomic.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

# Force test env BEFORE importing the app
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("APP_DEBUG", "true")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://nhpmbr:nhpmbr_dev_password_change_me@localhost:5432/nhpmbr",
)
os.environ.setdefault(
    "SYNC_DATABASE_URL",
    "postgresql+psycopg://nhpmbr:nhpmbr_dev_password_change_me@localhost:5432/nhpmbr",
)

from app.main import app  # noqa: E402


@pytest.fixture()
def client() -> TestClient:
    """Sync TestClient for endpoints that don't need a database."""
    return TestClient(app)


@pytest.fixture()
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """Async client for integration tests."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
