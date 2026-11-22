import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.init_db import init_db
from app.api.claims import router as claims_router
from app.api.hitl import router as hitl_router
from app.api.dashboard import router as dashboard_router
from app.api.scenarios import router as scenarios_router

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("claimflow")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ClaimFlow AI Backend...")
    # Seed database and verify tables
    init_db()
    # Warm up policies directory
    os.makedirs("sample_data/policies", exist_ok=True)
    os.makedirs("sample_data/invoices", exist_ok=True)
    os.makedirs("uploads", exist_ok=True)
    logger.info("Database and sample directories verified.")
    yield
    logger.info("ClaimFlow AI Backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-Agent P&C Auto Claims Adjudication, Fraud & Subrogation Orchestrator for ValueMomentum",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for policy documents and uploaded invoices
if os.path.exists("sample_data"):
    app.mount("/sample_data", StaticFiles(directory="sample_data"), name="sample_data")
if os.path.exists("uploads"):
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include API Routers
app.include_router(claims_router)
app.include_router(hitl_router)
app.include_router(dashboard_router)
app.include_router(scenarios_router)

# Mount frontend production build if available
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "llm_provider": "MockLLM (Deterministic Offline)" if settings.MOCK_LLM else (
            "Google Gemini" if settings.GEMINI_API_KEY else "Groq / Ollama Fallback"
        ),
        "checkpointer": "SQLite Durable Checkpointer"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
