import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    DateTime,
    Text,
    Integer,
    ForeignKey,
    Index
)
from app.db.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_number = Column(String(32), unique=True, nullable=False, index=True)
    policy_number = Column(String(32), nullable=False, index=True)
    claimant_name_masked = Column(String(128), default="[CLAIMANT]")
    vehicle_vin = Column(String(32), nullable=True)
    incident_date = Column(String(16), nullable=False)
    loss_type = Column(String(32), default="Collision")
    
    claimed_amount = Column(Float, default=0.0)
    approved_amount = Column(Float, default=0.0)
    disallowed_amount = Column(Float, default=0.0)
    deductible = Column(Float, default=500.0)
    net_payout = Column(Float, default=0.0)
    
    fraud_risk_score = Column(Float, default=0.0)
    subrogation_likelihood = Column(String(16), default="LOW")
    status = Column(String(32), default="SUBMITTED", index=True)  # SUBMITTED, ANALYZING, APPROVED_STP, PENDING_HITL, RESOLVED, DENIED
    
    rag_citations_json = Column(Text, default="[]")
    guidewire_payload_json = Column(Text, default="{}")
    itemized_audit_json = Column(Text, default="[]")
    agent_trace_json = Column(Text, default="{}")
    
    thread_id = Column(String(64), nullable=False, index=True)
    raw_pdf_path = Column(String(256), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    policy_number = Column(String(32), unique=True, nullable=False, index=True)
    holder_name = Column(String(128), nullable=False)
    vin = Column(String(32), nullable=False)
    effective_date = Column(String(16), nullable=False)
    expiration_date = Column(String(16), nullable=False)
    policy_type = Column(String(64), default="Standard Auto")
    collision_limit = Column(Float, default=50000.0)
    comprehensive_limit = Column(Float, default=50000.0)
    deductible = Column(Float, default=500.0)
    pdf_filename = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RepairBenchmark(Base):
    __tablename__ = "repair_benchmarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    part_or_operation = Column(String(128), nullable=False, index=True)
    category = Column(String(32), nullable=False)  # parts, labor, paint
    max_allowed_cost = Column(Float, nullable=True)
    typical_hours = Column(Float, nullable=True)
    hourly_rate_cap = Column(Float, nullable=True)


class HITLDecision(Base):
    __tablename__ = "hitl_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_id = Column(String(36), ForeignKey("claims.id"), nullable=False, index=True)
    adjuster_id = Column(String(64), default="ADJ-10492")
    decision = Column(String(32), nullable=False)  # APPROVE, OVERRIDE_PAYOUT, DENY, REFER_SIU
    audit_note = Column(Text, nullable=False)
    original_payout = Column(Float, default=0.0)
    adjusted_payout = Column(Float, default=0.0)
    settlement_letter_text = Column(Text, nullable=True)
    decided_at = Column(DateTime, default=datetime.utcnow)


class ClaimAuditEvent(Base):
    __tablename__ = "claim_audit_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    claim_id = Column(String(36), ForeignKey("claims.id"), nullable=False, index=True)
    agent_name = Column(String(64), nullable=False)
    event_type = Column(String(64), nullable=False)
    payload_json = Column(Text, default="{}")
    token_map_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)
