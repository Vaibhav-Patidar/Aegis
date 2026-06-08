"""
Authentication endpoints — signup and login via Supabase Auth.

Signup creates a new org, user, and Supabase auth user.
Login delegates entirely to Supabase Auth.
Rate limited to prevent abuse.
"""

import logging
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, Field
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_supabase

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    org_name: str = Field(..., min_length=1, max_length=200)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str
    org_id: str
    org_name: str | None = None


# ------------------------------------------------------------------
# POST /auth/signup
# ------------------------------------------------------------------

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(request: Request, body: SignupRequest):
    """
    Create a new user account with an organization.

    Flow:
        1. Create auth user in Supabase Auth
        2. Create org record in orgs table
        3. Create user record in users table with role='admin'
        4. Return JWT token
    """
    supabase = get_supabase()

    # Step 1: Create Supabase Auth user
    try:
        auth_response = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception as e:
        logger.error("Supabase auth signup failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user account. Email may already be registered.",
        )

    if not auth_response.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create user account.",
        )

    auth_user_id = auth_response.user.id
    access_token = auth_response.session.access_token if auth_response.session else ""

    # Step 2: Create org record
    org_id = str(uuid4())
    try:
        supabase.table("orgs").insert(
            {
                "id": org_id,
                "name": body.org_name,
            }
        ).execute()
    except Exception as e:
        logger.error("Failed to create org for user %s: %s", auth_user_id, str(e))
        # Attempt cleanup of the auth user
        try:
            supabase.auth.admin.delete_user(auth_user_id)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create organization",
        )

    # Step 3: Create user record linked to org
    try:
        supabase.table("users").insert(
            {
                "id": auth_user_id,
                "org_id": org_id,
                "email": body.email,
                "role": "admin",
            }
        ).execute()
    except Exception as e:
        logger.error("Failed to create user record %s: %s", auth_user_id, str(e))
        # Attempt cleanup
        try:
            supabase.table("orgs").delete().eq("id", org_id).execute()
            supabase.auth.admin.delete_user(auth_user_id)
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user profile",
        )

    logger.info("User signed up: user=%s, org=%s", auth_user_id, org_id)

    return AuthResponse(
        access_token=access_token,
        user_id=str(auth_user_id),
        email=body.email,
        org_id=org_id,
        org_name=body.org_name,
    )


# ------------------------------------------------------------------
# POST /auth/login
# ------------------------------------------------------------------

@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    """
    Log in via Supabase Auth. Returns JWT token and user info.
    """
    supabase = get_supabase()

    try:
        auth_response = supabase.auth.sign_in_with_password(
            {
                "email": body.email,
                "password": body.password,
            }
        )
    except Exception as e:
        logger.warning("Login failed for %s: %s", body.email, str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not auth_response.user or not auth_response.session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    auth_user_id = auth_response.user.id
    access_token = auth_response.session.access_token

    # Fetch org info from users table
    try:
        user_result = (
            supabase.table("users")
            .select("org_id")
            .eq("id", str(auth_user_id))
            .single()
            .execute()
        )
        org_id = user_result.data.get("org_id", "") if user_result.data else ""
    except Exception:
        org_id = ""

    # Fetch org name
    org_name = None
    if org_id:
        try:
            org_result = (
                supabase.table("orgs")
                .select("name")
                .eq("id", org_id)
                .single()
                .execute()
            )
            org_name = org_result.data.get("name") if org_result.data else None
        except Exception:
            pass

    logger.info("User logged in: user=%s", auth_user_id)

    return AuthResponse(
        access_token=access_token,
        user_id=str(auth_user_id),
        email=body.email,
        org_id=str(org_id),
        org_name=org_name,
    )
