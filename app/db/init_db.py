from app.db.database import sync_engine, Base
from app.db.models import Claim, Policy, RepairBenchmark, HITLDecision, ClaimAuditEvent
from app.tools.deterministic_math import DEFAULT_BENCHMARKS
from sqlalchemy.orm import Session


def init_db():
    Base.metadata.create_all(bind=sync_engine)
    
    # Seed default repair benchmarks if empty
    with Session(sync_engine) as session:
        count = session.query(RepairBenchmark).count()
        if count == 0:
            benchmarks_to_add = []
            for part, rule in DEFAULT_BENCHMARKS.items():
                benchmarks_to_add.append(
                    RepairBenchmark(
                        part_or_operation=part,
                        category=rule.category,
                        max_allowed_cost=rule.max_unit_cost,
                        typical_hours=rule.max_hours,
                        hourly_rate_cap=rule.max_hourly_rate
                    )
                )
            session.add_all(benchmarks_to_add)
        # Seed default policies if empty
        pol_count = session.query(Policy).count()
        if pol_count == 0:
            policies_to_add = [
                Policy(
                    policy_number="POL-882910",
                    holder_name="Alex Mercer",
                    vin="1HGCR2F83HA001234",
                    effective_date="2026-01-01",
                    expiration_date="2027-01-01",
                    policy_type="Standard Auto",
                    collision_limit=50000.0,
                    comprehensive_limit=50000.0,
                    deductible=500.0,
                    pdf_filename="standard_auto_policy.pdf"
                ),
                Policy(
                    policy_number="POL-994102",
                    holder_name="Jordan Kelly",
                    vin="4T1B11HK5JU543210",
                    effective_date="2026-03-01",
                    expiration_date="2027-03-01",
                    policy_type="Comprehensive Plus",
                    collision_limit=100000.0,
                    comprehensive_limit=100000.0,
                    deductible=250.0,
                    pdf_filename="comprehensive_plus_policy.pdf"
                ),
                Policy(
                    policy_number="POL-771920",
                    holder_name="Tyler Henderson",
                    vin="3FA6P0H78HR109876",
                    effective_date="2026-11-08",
                    expiration_date="2027-11-08",
                    policy_type="Standard Auto",
                    collision_limit=50000.0,
                    comprehensive_limit=50000.0,
                    deductible=500.0,
                    pdf_filename="standard_auto_policy.pdf"
                )
            ]
            session.add_all(policies_to_add)
            session.commit()
            print("Seeded default insurance policies into database.")


if __name__ == "__main__":
    init_db()
