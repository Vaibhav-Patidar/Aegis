"""
Supabase client singleton.

Uses the SERVICE KEY for backend operations — never expose this to the frontend.
The client is created once at module import and reused across the application.
"""

import os
import logging

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    logger.warning(
        "SUPABASE_URL or SUPABASE_SERVICE_KEY not set. "
        "Database operations will fail."
    )

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Return the singleton Supabase client, creating it on first call."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialized (service role)")
    return _supabase_client
