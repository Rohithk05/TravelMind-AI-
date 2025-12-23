from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from typing import Optional

from .auth_utils import (
    get_current_user,
    Token,
    User
)
from app.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/auth", tags=["authentication"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", response_model=Token)
async def register(user_data: UserRegister):
    """
    Note: Registration is now handled directly by the frontend via Supabase.
    This endpoint remains for backward compatibility or direct API usage.
    """
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {"full_name": user_data.full_name}
            }
        })
        
        if not auth_response.session:
             return {"access_token": "email-confirmation-required", "token_type": "bearer"}
             
        return {"access_token": auth_response.session.access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """
    Note: Login is now handled directly by the frontend via Supabase.
    """
    try:
        supabase = get_supabase_client()
        auth_response = supabase.auth.sign_in_with_password({
            "email": user_data.email, 
            "password": user_data.password
        })
        return {"access_token": auth_response.session.access_token, "token_type": "bearer"}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user information (Verified via Supabase token)."""
    return current_user

@router.post("/logout")
async def logout():
    """Logout is handled client-side by clearing the Supabase session."""
    return {"message": "Successfully logged out"}
