import os
import sqlite3
from typing import Optional, Any
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.checkpoint.memory import MemorySaver
from app.config import settings

_global_checkpointer: Optional[Any] = None


def get_checkpointer(db_path: Optional[str] = None):
    """
    Returns a durable SQLite checkpointer for LangGraph state persistence and HITL interrupt/resume.
    Falls back to MemorySaver if path is :memory:.
    """
    global _global_checkpointer
    if _global_checkpointer is not None:
        return _global_checkpointer

    path = db_path or settings.CHECKPOINT_DB_PATH
    if path == ":memory:":
        _global_checkpointer = MemorySaver()
        return _global_checkpointer

    # Ensure parent dir exists
    db_dir = os.path.dirname(os.path.abspath(path))
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

    conn = sqlite3.connect(path, check_same_thread=False)
    _global_checkpointer = SqliteSaver(conn)
    return _global_checkpointer
