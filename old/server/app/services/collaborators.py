import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from . import storage

COLLABORATORS_FILE = "collaborators.json"
PROFILES_FILE = "collaborator_profiles.json"
TERMS_FILE = "collaborator_terms.json"
METRICS_FILE = "collaborator_metrics.json"

DEFAULT_ROLE = "FIELD_SPECIALIST"
COLLABORATOR_ROLES = [DEFAULT_ROLE, "ADMIN_SUPPORT", "APPRENTICE"]
COLLABORATOR_PERMISSIONS = [
    "requests:read",
    "requests:update",
    "quotes:manage",
    "schedule:manage",
    "evidence:upload",
    "chat:access",
    "payments:view",
]

DEFAULT_DOCUMENTS = [
    {"type": "dni_front", "label": "DNI (frente)", "required": True},
    {"type": "dni_back", "label": "DNI (dorso)", "required": True},
    {"type": "cap", "label": "Certificado de antecedentes penales", "required": True},
    {"type": "matricula", "label": "Matrícula habilitante (si corresponde)", "required": False},
    {"type": "afip", "label": "Constancia AFIP / CUIT", "required": True},
]


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _normalize_roles(roles: Optional[List[str]]) -> List[str]:
    if not roles:
        return [DEFAULT_ROLE]
    unique: List[str] = []
    for role in roles:
        role_id = str(role).strip().upper()
        if role_id and role_id in COLLABORATOR_ROLES and role_id not in unique:
            unique.append(role_id)
    return unique or [DEFAULT_ROLE]


def _normalize_permissions(permissions: Optional[List[str]]) -> List[str]:
    if not permissions:
        return list(COLLABORATOR_PERMISSIONS)
    unique: List[str] = []
    for perm in permissions:
        perm_id = str(perm).strip().lower()
        if perm_id and perm_id in COLLABORATOR_PERMISSIONS and perm_id not in unique:
            unique.append(perm_id)
    return unique or list(COLLABORATOR_PERMISSIONS)


def list_collaborators(provider_id: Optional[str] = None) -> List[Dict[str, Any]]:
    items = storage.read_json(COLLABORATORS_FILE, [])
    if provider_id:
        return [item for item in items if item.get("provider_id") == provider_id and item.get("status") != "REMOVED"]
    return items


def find_collaborator(collaborator_id: str) -> Optional[Dict[str, Any]]:
    items = storage.read_json(COLLABORATORS_FILE, [])
    return next((item for item in items if item.get("id") == collaborator_id), None)


def create_collaborator(data: Dict[str, Any]) -> Dict[str, Any]:
    items = storage.read_json(COLLABORATORS_FILE, [])
    collaborator_id = f"col_{uuid.uuid4().hex[:12]}"
    email = str(data.get("email", "")).strip().lower()
    provider_id = str(data.get("provider_id", "")).strip()
    now = _now_iso()
    record = {
        "id": collaborator_id,
        "provider_id": provider_id,
        "email": email,
        "display_name": str(data.get("display_name", "")).strip(),
        "phone": (lambda value: (value.strip() or None) if isinstance(value, str) else None)(data.get("phone")),
        "roles": _normalize_roles(data.get("roles")),
        "permissions": _normalize_permissions(data.get("permissions")),
        "status": (str(data.get("status", "INVITED")).strip().upper() or "INVITED"),
        "invited_by": str(data.get("invited_by", provider_id)).strip() or provider_id,
        "user_id": data.get("user_id"),
        "invitation_accepted_at": data.get("invitation_accepted_at"),
        "created_at": now,
        "updated_at": now,
    }
    items.append(record)
    storage.write_json(COLLABORATORS_FILE, items)
    ensure_collaborator_profile(collaborator_id, provider_id)
    ensure_collaborator_metrics(collaborator_id, provider_id)
    return record


def update_collaborator(collaborator_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    items = storage.read_json(COLLABORATORS_FILE, [])
    updated_item: Optional[Dict[str, Any]] = None
    for idx, item in enumerate(items):
        if item.get("id") != collaborator_id:
            continue
        if "display_name" in patch and isinstance(patch["display_name"], str):
            item["display_name"] = patch["display_name"].strip()
        if "phone" in patch:
            phone = patch["phone"]
            if phone is None:
                item["phone"] = None
            elif isinstance(phone, str):
                item["phone"] = phone.strip() or None
        if "roles" in patch:
            item["roles"] = _normalize_roles(patch.get("roles"))
        if "permissions" in patch:
            item["permissions"] = _normalize_permissions(patch.get("permissions"))
        if "status" in patch and patch["status"]:
            item["status"] = str(patch["status"]).strip().upper()
        if "user_id" in patch:
            item["user_id"] = patch.get("user_id")
        if "invitation_accepted_at" in patch:
            item["invitation_accepted_at"] = patch.get("invitation_accepted_at")
        item["updated_at"] = _now_iso()
        items[idx] = item
        updated_item = item
        break
    if updated_item is None:
        return None
    storage.write_json(COLLABORATORS_FILE, items)
    return updated_item


def remove_collaborator(collaborator_id: str) -> bool:
    items = storage.read_json(COLLABORATORS_FILE, [])
    changed = False
    for idx, item in enumerate(items):
        if item.get("id") == collaborator_id and item.get("status") != "REMOVED":
            item["status"] = "REMOVED"
            item["updated_at"] = _now_iso()
            items[idx] = item
            changed = True
            break
    if changed:
        storage.write_json(COLLABORATORS_FILE, items)
    return changed


def ensure_collaborator_profile(collaborator_id: str, provider_id: str) -> Dict[str, Any]:
    profiles = storage.read_json(PROFILES_FILE, [])
    for profile in profiles:
        if profile.get("collaborator_id") == collaborator_id:
            return profile

    documents = [
        {
            "collaborator_id": collaborator_id,
            "type": doc["type"],
            "label": doc["label"],
            "required": doc["required"],
            "status": "PENDING",
            "url": None,
            "uploaded_at": None,
            "notes": "",
        }
        for doc in DEFAULT_DOCUMENTS
    ]
    profile = {
        "collaborator_id": collaborator_id,
        "provider_id": provider_id,
        "overview": "",
        "documents": documents,
        "updated_at": _now_iso(),
    }
    profiles.append(profile)
    storage.write_json(PROFILES_FILE, profiles)
    return profile


def save_collaborator_profile(profile: Dict[str, Any]) -> Dict[str, Any]:
    profiles = storage.read_json(PROFILES_FILE, [])
    for idx, item in enumerate(profiles):
        if item.get("collaborator_id") == profile.get("collaborator_id"):
            profiles[idx] = profile
            break
    else:
        profiles.append(profile)
    storage.write_json(PROFILES_FILE, profiles)
    return profile


def list_collaborator_terms(collaborator_id: str) -> List[Dict[str, Any]]:
    terms = storage.read_json(TERMS_FILE, [])
    filtered = [item for item in terms if item.get("collaborator_id") == collaborator_id]
    return sorted(filtered, key=lambda item: item.get("accepted_at", ""), reverse=True)


def register_collaborator_terms(entry: Dict[str, Any]) -> Dict[str, Any]:
    terms = storage.read_json(TERMS_FILE, [])
    log = {
        "id": f"colterms_{uuid.uuid4().hex[:12]}",
        "collaborator_id": entry["collaborator_id"],
        "provider_id": entry["provider_id"],
        "version": entry["version"],
        "contract_hash": entry.get("contract_hash"),
        "signature_hash": entry["signature_hash"],
        "accepted_at": entry.get("accepted_at") or _now_iso(),
    }
    terms.append(log)
    storage.write_json(TERMS_FILE, terms)
    return log


def ensure_collaborator_metrics(collaborator_id: str, provider_id: str) -> Dict[str, Any]:
    metrics = storage.read_json(METRICS_FILE, [])
    for snapshot in metrics:
        if snapshot.get("collaborator_id") == collaborator_id:
            return snapshot
    snapshot = {
        "collaborator_id": collaborator_id,
        "provider_id": provider_id,
        "requests_handled": 0,
        "quotes_issued": 0,
        "ratings_count": 0,
        "average_rating": None,
        "last_active_at": None,
        "updated_at": _now_iso(),
    }
    metrics.append(snapshot)
    storage.write_json(METRICS_FILE, metrics)
    return snapshot


def update_collaborator_metrics(collaborator_id: str, patch: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    metrics = storage.read_json(METRICS_FILE, [])
    for idx, item in enumerate(metrics):
        if item.get("collaborator_id") != collaborator_id:
            continue
        item.update(
            {
                "provider_id": patch.get("provider_id", item.get("provider_id")),
                "requests_handled": patch.get("requests_handled", item.get("requests_handled", 0)),
                "quotes_issued": patch.get("quotes_issued", item.get("quotes_issued", 0)),
                "ratings_count": patch.get("ratings_count", item.get("ratings_count", 0)),
                "average_rating": patch.get("average_rating", item.get("average_rating")),
                "last_active_at": patch.get("last_active_at", item.get("last_active_at")),
                "updated_at": _now_iso(),
            }
        )
        metrics[idx] = item
        storage.write_json(METRICS_FILE, metrics)
        return item
    return None
