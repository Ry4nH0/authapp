# models/user.py
from pydantic import BaseModel, Field
from typing import List

class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=128)

class LoginRequest(BaseModel):
    username: str
    password: str

class AuthResponse(BaseModel):
    token: str
    username: str

# NEW: list usernames response
class UsernamesResponse(BaseModel):
    usernames: List[str]
