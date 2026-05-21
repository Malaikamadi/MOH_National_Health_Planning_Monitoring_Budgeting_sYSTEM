"""OpenTelemetry + Sentry initialisation.

Both are no-ops if the relevant env vars are not set. Heavy SDK imports
are deferred to the moment we actually install them, so a dev environment
without telemetry pays zero import cost.
"""

from __future__ import annotations

from fastapi import FastAPI

from app.core.config import settings


def install_telemetry(app: FastAPI) -> None:
    _install_sentry()
    _install_otel(app)


def _install_sentry() -> None:
    if not settings.sentry_dsn:
        return
    import sentry_sdk  # noqa: PLC0415 — lazy import; only when actually configured

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment=settings.app_env,
        traces_sample_rate=0.1 if settings.is_production else 1.0,
        profiles_sample_rate=0.1 if settings.is_production else 0.0,
        send_default_pii=False,
    )


def _install_otel(app: FastAPI) -> None:
    if not settings.otel_exporter_otlp_endpoint:
        return

    # All OTel SDK imports happen here so a misbehaving instrumentation
    # package never blocks app boot in environments without telemetry.
    from opentelemetry import trace  # noqa: PLC0415
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import (  # noqa: PLC0415
        OTLPSpanExporter,
    )
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor  # noqa: PLC0415
    from opentelemetry.instrumentation.sqlalchemy import (  # noqa: PLC0415
        SQLAlchemyInstrumentor,
    )
    from opentelemetry.sdk.resources import Resource  # noqa: PLC0415
    from opentelemetry.sdk.trace import TracerProvider  # noqa: PLC0415
    from opentelemetry.sdk.trace.export import BatchSpanProcessor  # noqa: PLC0415

    resource = Resource.create(
        {
            "service.name": settings.otel_service_name,
            "service.version": "0.1.0",
            "deployment.environment": settings.app_env,
        }
    )
    provider = TracerProvider(resource=resource)
    provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=settings.otel_exporter_otlp_endpoint))
    )
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app, excluded_urls="healthz,readyz,metrics")
    SQLAlchemyInstrumentor().instrument(enable_commenter=True)
