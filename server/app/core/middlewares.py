from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import time

# super simple rate limiter per IP (demo-level)
BUCKET = {}

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['Permissions-Policy'] = 'geolocation=()'
        response.headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload'
        return response

class ThrottleMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = request.client.host if request.client else 'unknown'
        now = time.time()
        w = BUCKET.get(ip, [])
        # keep last 60s
        w = [t for t in w if now - t < 60]
        if len(w) > 120: # 120 req/min demo
            from starlette.responses import JSONResponse
            return JSONResponse({"detail":"Rate limit exceeded"}, status_code=429)
        w.append(now)
        BUCKET[ip]=w
        return await call_next(request)
