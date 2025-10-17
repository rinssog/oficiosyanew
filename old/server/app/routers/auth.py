from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

router = APIRouter()

class LoginReq(BaseModel):
    email: str
    password: str

@router.post("/auth/login")
def login(body: LoginReq, user_agent: str | None = Header(default=None)):
    email = (body.email or "").lower().strip()
    if not (email.endswith("@oy.dev") and len(body.password) >= 6):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    role = "user"
    if email.startswith("admin"):
        role = "admin"
    elif email.startswith("pro"):
        role = "pro"
    return {"ok": True, "role": role, "token": "mock-token", "email": email, "ua": user_agent}
