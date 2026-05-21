"""FastAPI entry point.

Composes the modular monolith: every domain module contributes a router,
and this file is the only place that mounts them.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from importlib import metadata as importlib_metadata

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from app.core.config import settings
from app.core.errors import install_error_handlers
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestContextMiddleware
from app.core.telemetry import install_telemetry
from app.modules.audit import router as audit_router
from app.modules.doc import router as doc_router
from app.modules.iam import router as iam_router
from app.modules.mdm import router as mdm_router
from app.modules.org import router as org_router
from app.modules.planning import router as planning_router
from app.modules.strategy import router as strategy_router
from app.modules.workflow import router as workflow_router

configure_logging()
log = get_logger("nhpmbr.boot")


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ARG001, ANN201
    log.info(
        "app.startup",
        env=settings.app_env,
        version=_version(),
        oidc_issuer=settings.oidc_issuer,
    )
    yield
    log.info("app.shutdown")


def _version() -> str:
    try:
        return importlib_metadata.version("nhpmbr-api")
    except importlib_metadata.PackageNotFoundError:
        return "0.1.0-local"


def create_app() -> FastAPI:
    app = FastAPI(
        title="NHPMBR API",
        description=(
            "National Health Planning, Monitoring, Budgeting & Reporting Platform — "
            "FastAPI modular monolith."
        ),
        version=_version(),
        default_response_class=ORJSONResponse,
        docs_url="/docs" if settings.is_dev_like else None,
        redoc_url="/redoc" if settings.is_dev_like else None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.app_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )
    app.add_middleware(RequestContextMiddleware)

    install_error_handlers(app)
    install_telemetry(app)

    app.include_router(iam_router.router, prefix="/api/v1/iam", tags=["iam"])
    app.include_router(org_router.router, prefix="/api/v1/org", tags=["org"])
    app.include_router(mdm_router.router, prefix="/api/v1/mdm", tags=["master-data"])
    app.include_router(strategy_router.router, prefix="/api/v1/strategy", tags=["strategy"])
    app.include_router(planning_router.router, prefix="/api/v1/planning", tags=["planning"])
    app.include_router(workflow_router.router, prefix="/api/v1/workflow", tags=["workflow"])
    app.include_router(doc_router.router, prefix="/api/v1/documents", tags=["documents"])
    app.include_router(audit_router.router, prefix="/api/v1/audit", tags=["audit"])

    @app.get("/healthz", tags=["meta"])
    async def healthz() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name, "version": _version()}

    @app.get("/readyz", tags=["meta"])
    async def readyz() -> dict[str, str]:
        return {"status": "ready"}

    return app


app = create_app()
