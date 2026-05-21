"""Documents HTTP routes — pre-signed upload URLs + metadata."""

from __future__ import annotations

import uuid
from typing import Annotated

import boto3
from botocore.client import Config
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.deps import DbSession
from app.core.security import CurrentPrincipal, require
from app.modules.doc.models import Document

router = APIRouter()


def _s3_client():  # noqa: ANN202
    return boto3.client(
        "s3",
        endpoint_url=settings.s3_endpoint,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        region_name=settings.s3_region,
        config=Config(signature_version="s3v4"),
        use_ssl=settings.s3_use_ssl,
    )


class PresignRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    mime_type: str = Field(min_length=1, max_length=128)
    size_bytes: int = Field(gt=0, le=100 * 1024 * 1024, description="Max 100MB")
    linked_entity: str
    linked_entity_id: uuid.UUID


class PresignResponse(BaseModel):
    document_id: uuid.UUID
    storage_bucket: str
    storage_key: str
    upload_url: str
    expires_in_seconds: int


@router.post(
    "/presign",
    response_model=PresignResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require("doc.upload"))],
    summary="Get a pre-signed URL for direct upload to object storage",
)
async def presign_upload(
    payload: PresignRequest,
    session: DbSession,
    principal: CurrentPrincipal,
) -> PresignResponse:
    doc_id = uuid.uuid4()
    key = f"{payload.linked_entity}/{payload.linked_entity_id}/{doc_id}/{payload.filename}"

    doc = Document(
        id=doc_id,
        name=payload.filename,
        mime_type=payload.mime_type,
        size_bytes=payload.size_bytes,
        content_sha256="pending",
        storage_bucket=settings.s3_bucket,
        storage_key=key,
        uploaded_by=principal.user_id,
        linked_entity=payload.linked_entity,
        linked_entity_id=payload.linked_entity_id,
    )
    session.add(doc)
    await session.commit()

    url = _s3_client().generate_presigned_url(
        "put_object",
        Params={
            "Bucket": settings.s3_bucket,
            "Key": key,
            "ContentType": payload.mime_type,
        },
        ExpiresIn=900,
    )
    return PresignResponse(
        document_id=doc_id,
        storage_bucket=settings.s3_bucket,
        storage_key=key,
        upload_url=url,
        expires_in_seconds=900,
    )


@router.get(
    "/by-entity",
    dependencies=[Depends(require("doc.read"))],
    summary="List documents linked to an entity",
)
async def list_for_entity(
    session: DbSession,
    entity_type: Annotated[str, Query()],
    entity_id: Annotated[uuid.UUID, Query()],
) -> list[dict]:
    from sqlalchemy import select

    stmt = select(Document).where(
        Document.linked_entity == entity_type,
        Document.linked_entity_id == entity_id,
    )
    rows = (await session.scalars(stmt)).all()
    return [
        {
            "id": str(d.id),
            "name": d.name,
            "mime_type": d.mime_type,
            "size_bytes": d.size_bytes,
            "uploaded_at": d.uploaded_at.isoformat(),
        }
        for d in rows
    ]
