# controllers/user_controller.py
from fastapi import HTTPException, status
from models.user import SignupRequest, LoginRequest, AuthResponse, UsernamesResponse
from services.user_service import UserService

class UserController:
    @staticmethod
    def signup(payload: SignupRequest) -> AuthResponse:
        if UserService.get_by_username(payload.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
        UserService.create_user(payload.username, payload.password)
        auth = UserService.issue_auth(payload.username)
        return AuthResponse(**auth)

    @staticmethod
    def login(payload: LoginRequest) -> AuthResponse:
        if not UserService.validate_login(payload.username, payload.password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        auth = UserService.issue_auth(payload.username)
        return AuthResponse(**auth)

    # NEW
    @staticmethod
    def list_usernames() -> UsernamesResponse:
        names = UserService.list_usernames()
        return UsernamesResponse(usernames=names)
