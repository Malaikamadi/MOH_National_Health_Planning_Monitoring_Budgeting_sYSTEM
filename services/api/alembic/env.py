"""Alembic environment for NHPMBR.

Loads the synchronous SQLAlchemy URL from app settings, and registers all
module metadata so autogenerate sees every table.
"""

from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.core.db import Base

# Import models so they register with Base.metadata
from app.modules.audit import models as audit_models  # noqa: F401
from app.modules.doc import models as doc_models  # noqa: F401
from app.modules.iam import models as iam_models  # noqa: F401
from app.modules.mdm import models as mdm_models  # noqa: F401
from app.modules.org import models as org_models  # noqa: F401
from app.modules.planning import models as planning_models  # noqa: F401
from app.modules.strategy import models as strategy_models  # noqa: F401
from app.modules.workflow import models as workflow_models  # noqa: F401

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", str(settings.sync_database_url))

target_metadata = Base.metadata

SCHEMA_LIST = ["iam", "org", "mdm", "strategy", "planning", "workflow", "doc", "audit", "sync"]


def include_object(obj, name, type_, reflected, compare_to):  # noqa: ANN001, ARG001
    """Only manage objects in our app schemas."""
    if type_ == "table" and obj.schema not in SCHEMA_LIST:
        return False
    return True


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
        include_object=include_object,
        version_table_schema="public",
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_schemas=True,
            include_object=include_object,
            version_table_schema="public",
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
