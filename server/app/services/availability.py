import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from . import storage

SCHEDULES_FILE = "schedules.json"


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _time_to_minutes(value: str) -> int:
    try:
        hours, minutes = value.split(":")
        return int(hours) * 60 + int(minutes)
    except Exception as exc:  # pragma: no cover - defensive
        raise ValueError(f"Formato horario inválido: {value}") from exc


def _overlaps(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    a_start = _time_to_minutes(start_a)
    a_end = _time_to_minutes(end_a)
    b_start = _time_to_minutes(start_b)
    b_end = _time_to_minutes(end_b)
    return a_start < b_end and b_start < a_end


def list_reservations(provider_id: Optional[str] = None) -> List[Dict[str, Any]]:
    items = storage.read_json(SCHEDULES_FILE, [])
    if provider_id is None:
        return items
    return [item for item in items if item.get("provider_id") == provider_id]


def find_reservation(reservation_id: str) -> Optional[Dict[str, Any]]:
    items = storage.read_json(SCHEDULES_FILE, [])
    for item in items:
        if item.get("id") == reservation_id:
            return item
    return None


def reserve_slot(
    provider_id: str,
    *,
    date: str,
    start: str,
    end: str,
    label: Optional[str] = None,
    collaborator_id: Optional[str] = None,
    slot_code: Optional[str] = None,
    request_id: Optional[str] = None,
) -> Dict[str, Any]:
    start_minutes = _time_to_minutes(start)
    end_minutes = _time_to_minutes(end)
    if start_minutes >= end_minutes:
        raise ValueError("El horario seleccionado es inválido")

    items = storage.read_json(SCHEDULES_FILE, [])
    for item in items:
        if item.get("provider_id") == provider_id and item.get("date") == date:
            if _overlaps(start, end, item.get("start"), item.get("end")):
                raise ValueError("El proveedor ya tiene un turno en ese horario")
        if collaborator_id and item.get("collaborator_id") == collaborator_id and item.get("date") == date:
            if _overlaps(start, end, item.get("start"), item.get("end")):
                raise ValueError("El colaborador ya tiene un turno en ese horario")

    primary_id = f"slot_{uuid.uuid4().hex[:10]}"
    now = _now_iso()
    primary_record = {
        "id": primary_id,
        "provider_id": provider_id,
        "collaborator_id": None,
        "date": date,
        "start": start,
        "end": end,
        "label": label or "",
        "slot_code": slot_code,
        "linked_id": None,
        "request_id": request_id,
        "created_at": now,
    }
    items.append(primary_record)

    linked_record: Optional[Dict[str, Any]] = None
    if collaborator_id:
        collaborator_res_id = f"slot_{uuid.uuid4().hex[:10]}"
        linked_record = {
            "id": collaborator_res_id,
            "provider_id": provider_id,
            "collaborator_id": collaborator_id,
            "date": date,
            "start": start,
            "end": end,
            "label": label or "",
            "slot_code": slot_code,
            "linked_id": primary_id,
            "request_id": request_id,
            "created_at": now,
        }
        primary_record["linked_id"] = collaborator_res_id  # type: ignore[assignment]
        items.append(linked_record)

    storage.write_json(SCHEDULES_FILE, items)
    result: Dict[str, Any] = {"primary": primary_record}
    if linked_record:
        result["collaborator"] = linked_record
    return result


def release_reservation(reservation_id: str) -> int:
    items = storage.read_json(SCHEDULES_FILE, [])
    remaining: List[Dict[str, Any]] = []
    removed_ids: List[str] = []

    for item in items:
        if item.get("id") == reservation_id or item.get("linked_id") == reservation_id:
            removed_ids.append(item["id"])
            continue
        if item.get("id") in removed_ids:
            continue
        remaining.append(item)

    storage.write_json(SCHEDULES_FILE, remaining)
    return len(removed_ids)


def release_by_request(request_id: str) -> int:
    items = storage.read_json(SCHEDULES_FILE, [])
    remaining, removed = [], []
    for item in items:
        if item.get("request_id") == request_id:
            removed.append(item["id"])
            continue
        remaining.append(item)
    if removed:
        storage.write_json(SCHEDULES_FILE, remaining)
    return len(removed)


def update_request_reference(primary_reservation_id: str, request_id: str, collaborator_reservation_id: Optional[str] = None) -> None:
    items = storage.read_json(SCHEDULES_FILE, [])
    changed = False
    for item in items:
        if item.get("id") == primary_reservation_id:
            item["request_id"] = request_id
            changed = True
        if collaborator_reservation_id and item.get("id") == collaborator_reservation_id:
            item["request_id"] = request_id
            changed = True
    if changed:
        storage.write_json(SCHEDULES_FILE, items)
