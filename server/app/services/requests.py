import time
import uuid
from typing import Any, Dict, List, Optional

from . import availability, storage

REQUESTS_FILE = "requests.json"


def _now_ts() -> int:
    return int(time.time())


def list_requests() -> List[Dict[str, Any]]:
    return storage.read_json(REQUESTS_FILE, [])


def find_request(request_id: str) -> Optional[Dict[str, Any]]:
    items = storage.read_json(REQUESTS_FILE, [])
    for item in items:
        if item.get("id") == request_id:
            return item
    return None


def create_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    items = storage.read_json(REQUESTS_FILE, [])
    request_id = payload.get("id") or f"req_{uuid.uuid4().hex[:12]}"
    payload = {**payload}
    payload["id"] = request_id
    payload.setdefault("created_at", _now_ts())
    items.append(payload)
    storage.write_json(REQUESTS_FILE, items)
    return payload


def update_request(request_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    items = storage.read_json(REQUESTS_FILE, [])
    updated = None
    for idx, item in enumerate(items):
        if item.get("id") != request_id:
            continue
        item.update(patch)
        items[idx] = item
        updated = item
        break
    if updated is None:
        return None
    storage.write_json(REQUESTS_FILE, items)
    return updated


def delete_request(request_id: str) -> bool:
    items = storage.read_json(REQUESTS_FILE, [])
    remaining = [item for item in items if item.get("id") != request_id]
    if len(remaining) == len(items):
        return False
    storage.write_json(REQUESTS_FILE, remaining)
    availability.release_by_request(request_id)
    return True
