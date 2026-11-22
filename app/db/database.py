from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from app.config import settings

# Async Engine for FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Sync Engine for seed scripts and CLI tools
sync_engine = create_engine(
    settings.SYNC_DATABASE_URL,
    echo=False,
    future=True
)
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autoflush=False,
    autocommit=False
)

Base = declarative_base()


async def get_db():
    """FastAPI dependency for async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
