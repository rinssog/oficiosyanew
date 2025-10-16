import json
from pathlib import Path
from typing import Any, List, MutableSequence, TypeVar, Union

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

T = TypeVar("T", bound=MutableSequence[Any])


def _path(name: Union[str, Path]) -> Path:
    return DATA_DIR / name


def _ensure_file(path: Path, default: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        with path.open("w", encoding="utf-8") as fh:
            json.dump(default, fh, ensure_ascii=False, indent=2)


def read_json(name: Union[str, Path], default: Any) -> Any:
    """
    Read a JSON file from the data directory, returning `default` if missing.
    The returned object is a deep copy (via json round-trip) to avoid caller mutations.
    """
    path = _path(name)
    _ensure_file(path, default)
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def write_json(name: Union[str, Path], payload: Any) -> None:
    path = _path(name)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
