# services/user_service.py
from typing import Optional, List
from db.supabase import get_supabase
from services.auth_service import hash_password, verify_password, make_token

USERS_TABLE = "users"

class UserService:
    @staticmethod
    def get_by_username(username: str) -> Optional[dict]:
        sb = get_supabase()
        resp = sb.table(USERS_TABLE).select("*").eq("username", username).limit(1).execute()
        if resp.data:
            return resp.data[0]
        return None

    @staticmethod
    def create_user(username: str, password: str) -> dict:
        sb = get_supabase()
        password_hash = hash_password(password)
        resp = sb.table(USERS_TABLE).insert({"username": username, "password_hash": password_hash}).execute()
        return resp.data[0]

    @staticmethod
    def issue_auth(username: str) -> dict:
        token = make_token({"sub": username})
        return {"token": token, "username": username}

    @staticmethod
    def validate_login(username: str, password: str) -> bool:
        user = UserService.get_by_username(username)
        if not user:
            return False
        return verify_password(password, user["password_hash"])

    # NEW: list all usernames (ordered by created_at ascending)
    @staticmethod
    def list_usernames() -> List[str]:
        sb = get_supabase()
        resp = (
            sb.table(USERS_TABLE)
              .select("username")
              .order("created_at", desc=False)
              .execute()
        )
        return [row["username"] for row in (resp.data or [])]
