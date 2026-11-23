import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from app.db.database import get_db
from app.db.models import Claim, HITLDecision, ClaimAuditEvent

logger = logging.getLogger("claimflow.api.demo")
router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/reset")
async def reset_demo_data(db: AsyncSession = Depends(get_db)):
    """
    Resets the database by clearing demo claims and restoring the initial state.
    Available in local mode and development for repeatable testing.
    """
    logger.info("Resetting demo data...")
    # Delete test claims
    await db.execute(delete(ClaimAuditEvent))
    await db.execute(delete(HITLDecision))
    await db.execute(delete(Claim))
    await db.commit()

    return {
        "status": "success",
        "message": "Demo database successfully reset to clean initial state."
    }
