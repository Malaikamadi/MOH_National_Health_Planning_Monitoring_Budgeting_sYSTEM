"""Smoke tests — boot the app and hit the health endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_healthz(client: TestClient) -> None:
    r = client.get("/healthz")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["service"] == "nhpmbr"


def test_readyz(client: TestClient) -> None:
    r = client.get("/readyz")
    assert r.status_code == 200
    assert r.json() == {"status": "ready"}


def test_openapi_published(client: TestClient) -> None:
    r = client.get("/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    assert spec["info"]["title"] == "NHPMBR API"
    paths = spec["paths"]
    # Verify each module mounted a router
    assert any(p.startswith("/api/v1/iam") for p in paths)
    assert any(p.startswith("/api/v1/org") for p in paths)
    assert any(p.startswith("/api/v1/planning") for p in paths)


def test_protected_endpoint_requires_token(client: TestClient) -> None:
    r = client.get("/api/v1/iam/me")
    assert r.status_code == 401
