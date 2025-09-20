# services/auth_service.py
import os, time
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import jwt, JWTError
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ.get("JWT_SECRET", "devsecret-change-me")
JWT_ALG = "HS256"
JWT_TTL_SECONDS = int(os.environ.get("JWT_TTL_SECONDS", "3600"))

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def make_token(claims: Dict[str, Any], ttl: Optional[int] = None) -> str:
    now = int(time.time())
    payload = {"iat": now, "exp": now + (ttl or JWT_TTL_SECONDS), **claims}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

# NEW: decode & verify JWT -> returns claims (e.g., {"sub": "alice", "exp": ...})
def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError as e:
        raise ValueError("Invalid or expired token") from e
