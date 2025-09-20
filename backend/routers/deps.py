# routers/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import decode_token

security = HTTPBearer(auto_error=False)

def require_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not creds or creds.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or malformed",
        )
    try:
        claims = decode_token(creds.credentials)
        # claims["sub"] holds the username we issued in make_token({"sub": username})
        return claims
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
