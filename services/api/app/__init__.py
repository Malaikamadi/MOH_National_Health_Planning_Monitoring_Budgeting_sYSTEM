"""NHPMBR API — FastAPI modular monolith.

Each domain capability lives under :mod:`app.modules` and exposes:

* ``router.py``  — public HTTP routes (mounted on the FastAPI app)
* ``api.py``     — internal Python interface for cross-module calls
                   (the **only** import path other modules may use)
* ``service.py`` — business logic
* ``repository.py`` — data access via SQLAlchemy
* ``models.py``  — ORM models (own their schema)
* ``schemas.py`` — Pydantic DTOs

Cross-module SQL or direct imports of another module's internals are
prohibited and enforced by ``import-linter`` in CI.
"""

__version__ = "0.1.0"
