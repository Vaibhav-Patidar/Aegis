"""
JWT authentication middleware for Supabase Auth.

Validates tokens using the Supabase JWT secret and resolves org_id
from the users table — never trusts org_id from the frontend.
"""

import os
import logging
from uuid import UUID

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.database import get_supabase

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
JWT_ALGORITHM = "HS256"

security = HTTPBearer()


def verify_jwt_token(token: str) -> str:
    """
    Decode and validate a Supabase JWT token.

    Returns:
        user_id (str): The 'sub' claim from the JWT — the Supabase auth user ID.

    Raises:
        HTTPException 401: If token is invalid, expired, or missing 'sub'.
    """
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier",
            )
        return user_id
    except JWTError as e:
        logger.warning("JWT validation failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    FastAPI dependency that extracts user identity from the JWT.

    Flow:
        1. Extract Bearer token from Authorization header
        2. Validate JWT and get user_id (sub claim)
        3. Query users table to get org_id (NEVER trust frontend)

    Returns:
        dict: {"user_id": UUID, "org_id": UUID}

    Raises:
        HTTPException 401: Invalid token or user not found in DB.
    """
    token = credentials.credentials
    user_id = verify_jwt_token(token)

    # Always resolve org_id from the database — never trust the frontend
    supabase = get_supabase()
    try:
        result = (
            supabase.table("users")
            .select("org_id")
            .eq("id", user_id)
            .single()
            .execute()
        )
    except Exception as e:
        logger.error("Failed to query users table for user %s: %s", user_id, str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not result.data:
        logger.warning("No user record found for auth user %s", user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    org_id = result.data.get("org_id")
    if not org_id:
        logger.warning("User %s has no org_id", user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not associated with an organization",
        )

    return {
        "user_id": UUID(user_id),
        "org_id": UUID(org_id) if isinstance(org_id, str) else org_id,
    }
