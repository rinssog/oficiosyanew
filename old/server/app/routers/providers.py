import json
import os
import random
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel, EmailStr, Field

from app.services import collaborators as collab_service
from app.services import availability as availability_service

router = APIRouter()


def _seeds(name: str) -> str:
    here = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.abspath(os.path.join(here, "..", "seeds", name))


def _load_providers() -> List[dict]:
    with open(_seeds("providers_seed.json"), "r", encoding="utf-8") as fh:
        return json.load(fh)


def _provider_exists(provider_id: str) -> bool:
    provider_id = str(provider_id)
    return any(str(item.get("id")) == provider_id for item in _load_providers())


class CollaboratorCreate(BaseModel):
    email: EmailStr
    display_name: str = Field(..., min_length=1, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    roles: Optional[List[str]] = None
    permissions: Optional[List[str]] = None
    invited_by: Optional[str] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    invitation_accepted_at: Optional[str] = None


class CollaboratorUpdate(BaseModel):
    display_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    phone: Optional[str] = Field(default=None, max_length=32)
    roles: Optional[List[str]] = None
    permissions: Optional[List[str]] = None
    status: Optional[str] = None
    user_id: Optional[str] = None
    invitation_accepted_at: Optional[str] = None


class CollaboratorProfileUpdate(BaseModel):
    overview: Optional[str] = Field(default=None, max_length=2000)


class CollaboratorTermsCreate(BaseModel):
    version: str = Field(..., min_length=1, max_length=50)
    signature_hash: str = Field(..., min_length=6, max_length=128)
    contract_hash: Optional[str] = Field(default=None, max_length=128)
    accepted_at: Optional[str] = None


class ScheduleReservePayload(BaseModel):
    date: str = Field(..., description="Fecha en formato YYYY-MM-DD")
    start: str = Field(..., description="Hora inicio HH:MM")
    end: str = Field(..., description="Hora fin HH:MM")
    label: Optional[str] = Field(default=None, max_length=120)
    slot_code: Optional[str] = Field(default=None, max_length=60)
    collaborator_id: Optional[str] = Field(default=None, max_length=60)
    request_id: Optional[str] = Field(default=None, max_length=60)


@router.get("/providers")
def list_providers():
    data = _load_providers()
    random.shuffle(data)
    return data


@router.get("/providers/{provider_id}/collaborators")
def list_provider_collaborators(provider_id: str):
    if not _provider_exists(provider_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    collaborators = collab_service.list_collaborators(str(provider_id))
    return {"collaborators": collaborators}


@router.post(
    "/providers/{provider_id}/collaborators",
    status_code=status.HTTP_201_CREATED,
)
def create_provider_collaborator(provider_id: str, payload: CollaboratorCreate):
    provider_id = str(provider_id)
    if not _provider_exists(provider_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")

    normalized_email = payload.email.lower()
    existing = collab_service.list_collaborators(provider_id)
    if any(item.get("email") == normalized_email and item.get("status") != "REMOVED" for item in existing):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un colaborador registrado con ese correo",
        )

    collaborator = collab_service.create_collaborator(
        {
            "provider_id": provider_id,
            "email": normalized_email,
            "display_name": payload.display_name.strip(),
            "phone": payload.phone.strip() if isinstance(payload.phone, str) else None,
            "roles": payload.roles,
            "permissions": payload.permissions,
            "invited_by": payload.invited_by or provider_id,
            "status": payload.status,
            "user_id": payload.user_id,
            "invitation_accepted_at": payload.invitation_accepted_at,
        }
    )
    return {"collaborator": collaborator}


@router.patch("/providers/{provider_id}/collaborators/{collaborator_id}")
def update_provider_collaborator(provider_id: str, collaborator_id: str, payload: CollaboratorUpdate):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")

    patch = payload.model_dump(exclude_unset=True)

    if "display_name" in patch and isinstance(patch["display_name"], str):
        patch["display_name"] = patch["display_name"].strip()
    if "phone" in patch:
        phone_value = patch["phone"]
        if isinstance(phone_value, str):
            patch["phone"] = phone_value.strip()
        elif phone_value is None:
            patch["phone"] = None

    updated = collab_service.update_collaborator(collaborator_id, patch)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    return {"collaborator": updated}


@router.delete(
    "/providers/{provider_id}/collaborators/{collaborator_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_provider_collaborator(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")

    collab_service.remove_collaborator(collaborator_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/providers/{provider_id}/collaborators/{collaborator_id}")
def retrieve_provider_collaborator(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    return {"collaborator": collaborator}


@router.get("/providers/{provider_id}/collaborators/{collaborator_id}/profile")
def get_collaborator_profile(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    profile = collab_service.ensure_collaborator_profile(collaborator_id, provider_id)
    return {"profile": profile}


@router.put("/providers/{provider_id}/collaborators/{collaborator_id}/profile")
def update_collaborator_profile(provider_id: str, collaborator_id: str, payload: CollaboratorProfileUpdate):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")

    profile = collab_service.ensure_collaborator_profile(collaborator_id, provider_id)
    if payload.overview is not None:
        profile["overview"] = payload.overview.strip()
    profile["updated_at"] = datetime.utcnow().isoformat() + "Z"
    collab_service.save_collaborator_profile(profile)
    return {"profile": profile}


@router.get("/providers/{provider_id}/collaborators/{collaborator_id}/documents")
def list_collaborator_documents(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    profile = collab_service.ensure_collaborator_profile(collaborator_id, provider_id)
    return {"documents": profile.get("documents", [])}


@router.get("/providers/{provider_id}/collaborators/{collaborator_id}/metrics")
def get_collaborator_metrics(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    metrics = collab_service.ensure_collaborator_metrics(collaborator_id, provider_id)
    return {"metrics": metrics}


@router.get("/providers/{provider_id}/schedule")
def list_provider_schedule(provider_id: str):
    if not _provider_exists(provider_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    reservations = availability_service.list_reservations(provider_id)
    return {"schedule": reservations}


@router.post("/providers/{provider_id}/schedule/reserve", status_code=status.HTTP_201_CREATED)
def reserve_provider_slot(provider_id: str, payload: ScheduleReservePayload):
    if not _provider_exists(provider_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    try:
        created = availability_service.reserve_slot(
            provider_id,
            date=payload.date,
            start=payload.start,
            end=payload.end,
            label=payload.label,
            collaborator_id=payload.collaborator_id,
            slot_code=payload.slot_code,
            request_id=payload.request_id,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return created


@router.delete("/providers/{provider_id}/schedule/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
def release_provider_slot(provider_id: str, reservation_id: str):
    if not _provider_exists(provider_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proveedor no encontrado")
    removed = availability_service.release_reservation(reservation_id)
    if removed == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reservación no encontrada")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/providers/{provider_id}/collaborators/{collaborator_id}/terms")
def list_collaborator_terms(provider_id: str, collaborator_id: str):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")
    history = collab_service.list_collaborator_terms(collaborator_id)
    return {"history": history}


@router.post(
    "/providers/{provider_id}/collaborators/{collaborator_id}/terms",
    status_code=status.HTTP_201_CREATED,
)
def accept_collaborator_terms(provider_id: str, collaborator_id: str, payload: CollaboratorTermsCreate):
    provider_id = str(provider_id)
    collaborator = collab_service.find_collaborator(collaborator_id)
    if not collaborator or collaborator.get("provider_id") != provider_id or collaborator.get("status") == "REMOVED":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador no encontrado")

    log = collab_service.register_collaborator_terms(
        {
            "collaborator_id": collaborator_id,
            "provider_id": provider_id,
            "version": payload.version,
            "signature_hash": payload.signature_hash,
            "contract_hash": payload.contract_hash,
            "accepted_at": payload.accepted_at,
        }
    )
    return {"log": log}
