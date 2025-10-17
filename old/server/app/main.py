from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.settings import settings
from app.core.middlewares import SecurityHeadersMiddleware, ThrottleMiddleware
from app.routers import catalog, providers, auth, requests

app = FastAPI(title="OficiosYa API — RC3")

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ThrottleMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(catalog.router,   prefix=settings.api_prefix, tags=["catalog"])
app.include_router(providers.router, prefix=settings.api_prefix, tags=["providers"])
app.include_router(auth.router,      prefix=settings.api_prefix, tags=["auth"])
app.include_router(requests.router,  prefix=settings.api_prefix, tags=["requests"])
