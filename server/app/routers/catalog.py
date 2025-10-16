from fastapi import APIRouter
import json, os

router = APIRouter()

def _seeds(name: str) -> str:
    here = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    return os.path.abspath(os.path.join(here, "..", "seeds", name))

@router.get("/catalog")
def get_catalog():
    with open(_seeds("catalog_full.json"), "r", encoding="utf-8") as f:
        return json.load(f)
