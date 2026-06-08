"""
Aegis Backend — Main application entry point.

No model loading at startup (HuggingFace Inference API = zero startup cost).
Registers all routers under /api/v1, adds CORS, rate limiting, and health check.
"""

import logging
import os

from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

load_dotenv()

from app.routers import auth, diagnose, incidents

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


# ------------------------------------------------------------------
# Lifespan — no model loading needed (HF Inference API)
# ------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Aegis backend starting up")
    logger.info("Environment: %s", os.getenv("ENVIRONMENT", "development"))
    logger.info("No local model loading — using HuggingFace Inference API")
    yield
    logger.info("Aegis backend shutting down")


# ------------------------------------------------------------------
# App setup
# ------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Aegis — Incident Intelligence Platform",
    version="2.0.0",
    description="AI-powered incident intelligence for engineering teams",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ------------------------------------------------------------------
# CORS
# ------------------------------------------------------------------

cors_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("CORS origins: %s", cors_origins)


# ------------------------------------------------------------------
# Register routers under /api/v1
# ------------------------------------------------------------------

app.include_router(auth.router, prefix="/api/v1")
app.include_router(incidents.router, prefix="/api/v1")
app.include_router(diagnose.router, prefix="/api/v1")


# ------------------------------------------------------------------
# Health check (no model_loaded field — nothing to load)
# ------------------------------------------------------------------

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint. Returns ok if the server is running."""
    return {"status": "ok"}
