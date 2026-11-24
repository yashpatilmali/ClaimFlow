from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class LineItem(BaseModel):
    description: str
    part_number: Optional[str] = None
    category: str = "parts"  # "parts", "labor", "paint", "sublet", "other"
    claimed_cost: float
    hours: Optional[float] = None
    hourly_rate: Optional[float] = None


class BenchmarkRule(BaseModel):
    category: str
    max_unit_cost: Optional[float] = None
    max_hourly_rate: Optional[float] = None
    max_hours: Optional[float] = None


# Default automotive repair industry benchmarks baseline
DEFAULT_BENCHMARKS: Dict[str, BenchmarkRule] = {
    "front bumper cover": BenchmarkRule(category="parts", max_unit_cost=650.00),
    "rear bumper cover": BenchmarkRule(category="parts", max_unit_cost=600.00),
    "headlight assembly": BenchmarkRule(category="parts", max_unit_cost=450.00),
    "side mirror assembly": BenchmarkRule(category="parts", max_unit_cost=350.00),
    "fender front": BenchmarkRule(category="parts", max_unit_cost=400.00),
    "hood": BenchmarkRule(category="parts", max_unit_cost=800.00),
    "windshield": BenchmarkRule(category="parts", max_unit_cost=550.00),
    "radiator": BenchmarkRule(category="parts", max_unit_cost=500.00),
    "paint labor": BenchmarkRule(category="paint", max_hourly_rate=75.00, max_hours=10.0),
    "body labor": BenchmarkRule(category="labor", max_hourly_rate=80.00, max_hours=20.0),
    "mechanical labor": BenchmarkRule(category="labor", max_hourly_rate=110.00, max_hours=15.0),
    "frame labor": BenchmarkRule(category="labor", max_hourly_rate=120.00, max_hours=10.0),
}


class PayoutCalculationResult(BaseModel):
    claimed_total: float
    approved_total: float
    disallowed_total: float
    coverage_limit: float
    deductible: float
    limit_applied: bool
    net_payout: float
    itemized_audit: List[Dict[str, Any]]
    formula_log: str


def calculate_payout(
    line_items: List[Dict[str, Any]],
    coverage_limit: float,
    deductible: float,
    benchmarks: Optional[Dict[str, BenchmarkRule]] = None,
) -> PayoutCalculationResult:
    """
    Deterministic payout calculator.
    Formula: net_payout = max(0.0, min(approved_total, coverage_limit) - deductible)
    Guarantees no floating-point LLM hallucination in financial calculations.
    """
    if benchmarks is None:
        benchmarks = DEFAULT_BENCHMARKS

    claimed_total = 0.0
    approved_total = 0.0
    itemized_audit = []

    for item in line_items:
        desc = str(item.get("description", "")).strip()
        claimed = float(item.get("claimed_cost", 0.0))
        hours = item.get("hours")
        hourly_rate = item.get("hourly_rate")
        category = str(item.get("category", "parts")).lower()

        claimed_total += claimed
        approved_item_cost = claimed
        disallowed_item_amount = 0.0
        audit_note = "Accepted within standard repair benchmark"

        # Lookup benchmark against description lowercased
        desc_lower = desc.lower()
        matched_benchmark = None
        for key, bench in benchmarks.items():
            if key in desc_lower:
                matched_benchmark = bench
                break

        if matched_benchmark:
            # Check parts capping
            if matched_benchmark.max_unit_cost is not None and claimed > matched_benchmark.max_unit_cost:
                disallowed_item_amount = round(claimed - matched_benchmark.max_unit_cost, 2)
                approved_item_cost = matched_benchmark.max_unit_cost
                audit_note = f"Capped to industry benchmark max ${matched_benchmark.max_unit_cost:.2f} (exceeded by ${disallowed_item_amount:.2f})"
            # Check labor hourly rate capping
            elif matched_benchmark.max_hourly_rate is not None and hourly_rate is not None:
                if hourly_rate > matched_benchmark.max_hourly_rate:
                    h = hours if hours is not None else (claimed / hourly_rate if hourly_rate > 0 else 1.0)
                    approved_item_cost = round(h * matched_benchmark.max_hourly_rate, 2)
                    disallowed_item_amount = round(claimed - approved_item_cost, 2)
                    audit_note = f"Labor hourly rate capped to ${matched_benchmark.max_hourly_rate:.2f}/hr (claimed ${hourly_rate:.2f}/hr)"

        approved_total += approved_item_cost
        itemized_audit.append({
            "description": desc,
            "category": category,
            "claimed_cost": round(claimed, 2),
            "approved_cost": round(approved_item_cost, 2),
            "disallowed_amount": round(disallowed_item_amount, 2),
            "audit_note": audit_note
        })

    claimed_total = round(claimed_total, 2)
    approved_total = round(approved_total, 2)
    disallowed_total = round(claimed_total - approved_total, 2)

    # Apply policy limit
    limit_applied = approved_total > coverage_limit
    payable_after_limit = min(approved_total, coverage_limit)

    # Apply deductible
    raw_net = payable_after_limit - deductible
    net_payout = round(max(0.0, raw_net), 2)

    formula_log = (
        f"Claimed: ${claimed_total:.2f} -> "
        f"Benchmark Approved: ${approved_total:.2f} (Disallowed: ${disallowed_total:.2f}) -> "
        f"Limit Applied: min(${approved_total:.2f}, ${coverage_limit:.2f}) = ${payable_after_limit:.2f} -> "
        f"Deductible Subtracted: ${payable_after_limit:.2f} - ${deductible:.2f} = ${raw_net:.2f} -> "
        f"Final Net Payout: ${net_payout:.2f}"
    )

    return PayoutCalculationResult(
        claimed_total=claimed_total,
        approved_total=approved_total,
        disallowed_total=disallowed_total,
        coverage_limit=round(coverage_limit, 2),
        deductible=round(deductible, 2),
        limit_applied=limit_applied,
        net_payout=net_payout,
        itemized_audit=itemized_audit,
        formula_log=formula_log,
    )
