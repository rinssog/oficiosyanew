import uuid
from typing import Optional, List

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services import availability as availability_service
from app.services import requests as requests_service

router = APIRouter()


class SchedulePayload(BaseModel):
    date: str = Field(..., description="Fecha en formato YYYY-MM-DD")
    start: str = Field(..., description="Hora inicio HH:MM")
    end: str = Field(..., description="Hora fin HH:MM")
    label: Optional[str] = Field(default=None, max_length=120)
    collaborator_id: Optional[str] = Field(default=None, max_length=60)
    slot_code: Optional[str] = Field(default=None, max_length=60)


class ServiceRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    provider_id: Optional[str] = Field(default=None, description="ID del proveedor seleccionado")
    category_id: str
    description: str
    schedule: Optional[SchedulePayload] = None


@router.post("/requests")
def create_request(body: ServiceRequest):
    request_id = f"req_{uuid.uuid4().hex[:12]}"
    schedule_info = None
    if body.schedule is not None:
        if not body.provider_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="provider_id es obligatorio para reservar un turno",
            )
        try:
            reservation = availability_service.reserve_slot(
                body.provider_id,
                date=body.schedule.date,
                start=body.schedule.start,
                end=body.schedule.end,
                label=body.schedule.label,
                collaborator_id=body.schedule.collaborator_id,
                slot_code=body.schedule.slot_code,
                request_id=request_id,
            )
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

        schedule_info = {
            "provider_reservation_id": reservation["primary"]["id"],
            "collaborator_reservation_id": reservation.get("collaborator", {}).get("id"),
            "date": body.schedule.date,
            "start": body.schedule.start,
            "end": body.schedule.end,
            "label": body.schedule.label,
        }

    payload = body.dict()
    payload["id"] = request_id
    payload["schedule"] = schedule_info
    record = requests_service.create_request(payload)
    return {"ok": True, "id": record["id"], "schedule": schedule_info}


@router.get("/requests")
def list_requests():
    items = requests_service.list_requests()
    return list(reversed(items))


@router.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_request(request_id: str):
    deleted = requests_service.delete_request(request_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud no encontrada")
    return None
