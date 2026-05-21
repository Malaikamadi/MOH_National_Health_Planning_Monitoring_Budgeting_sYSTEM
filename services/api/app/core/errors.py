"""Domain error hierarchy + FastAPI exception handlers.

Every error returned to a client has the same shape:

    {
        "error": {
            "code": "planning.awp.not_found",
            "message": "AWP 4f… not found.",
            "details": { ... },
            "request_id": "..."
        }
    }

This makes it trivial to localise messages on the client and to alert in Sentry.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


# ----- Hierarchy -----


class AppError(Exception):
    """Base class for all domain errors."""

    code: str = "app.error"
    http_status: int = status.HTTP_500_INTERNAL_SERVER_ERROR

    def __init__(self, message: str = "", details: dict[str, Any] | None = None) -> None:
        super().__init__(message or self.code)
        self.message = message or self.code
        self.details = details or {}


class NotFoundError(AppError):
    code = "app.not_found"
    http_status = status.HTTP_404_NOT_FOUND


class ConflictError(AppError):
    code = "app.conflict"
    http_status = status.HTTP_409_CONFLICT


class ValidationFailure(AppError):
    code = "app.validation_failed"
    http_status = status.HTTP_422_UNPROCESSABLE_ENTITY


class PermissionDenied(AppError):
    code = "app.permission_denied"
    http_status = status.HTTP_403_FORBIDDEN


class AuthenticationFailure(AppError):
    code = "app.authentication_failed"
    http_status = status.HTTP_401_UNAUTHORIZED


class RateLimited(AppError):
    code = "app.rate_limited"
    http_status = status.HTTP_429_TOO_MANY_REQUESTS


class IntegrationError(AppError):
    code = "app.integration_error"
    http_status = status.HTTP_502_BAD_GATEWAY


# ----- Handlers -----


def _payload(code: str, message: str, details: dict[str, Any], request: Request) -> dict[str, Any]:
    return {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": getattr(request.state, "request_id", None),
        }
    }


async def _app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.http_status,
        content=_payload(exc.code, exc.message, exc.details, request),
    )


async def _validation_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=_payload(
            "app.validation_failed",
            "Request validation failed.",
            {"errors": exc.errors()},
            request,
        ),
    )


async def _http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    code = f"http.{exc.status_code}"
    return JSONResponse(
        status_code=exc.status_code,
        content=_payload(code, str(exc.detail), {}, request),
    )


async def _unhandled_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=_payload(
            "app.internal_error",
            "An unexpected error occurred.",
            {"type": type(exc).__name__},
            request,
        ),
    )


def install_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, _validation_handler)  # type: ignore[arg-type]
    app.add_exception_handler(StarletteHTTPException, _http_exception_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, _unhandled_handler)
