# routers/user_router.py
from fastapi import APIRouter, Depends
from controllers.user_controller import UserController
from models.user import SignupRequest, LoginRequest, AuthResponse, UsernamesResponse
from routers.deps import require_user  # NEW

router = APIRouter()

@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    return UserController.signup(payload)

@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    return UserController.login(payload)

# Protected: requires Bearer JWT
@router.get("/users", response_model=UsernamesResponse)
def list_users(_claims: dict = Depends(require_user)):  # _claims["sub"] is the username
    return UserController.list_usernames()
