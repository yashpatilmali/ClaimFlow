import pytest
from app.tools.deterministic_math import calculate_payout, BenchmarkRule


def test_clean_payout_calculation():
    line_items = [
        {"description": "Front Bumper Cover", "claimed_cost": 650.00, "category": "parts"},
        {"description": "Lower Grille Assembly", "claimed_cost": 250.00, "category": "parts"},
        {"description": "Body Labor", "claimed_cost": 300.00, "category": "labor", "hours": 3.75, "hourly_rate": 80.00},
        {"description": "Paint Labor", "claimed_cost": 150.00, "category": "paint", "hours": 2.0, "hourly_rate": 75.00},
    ]
    coverage_limit = 50000.00
    deductible = 500.00

    result = calculate_payout(line_items, coverage_limit, deductible)

    # Claimed total: 650 + 250 + 300 + 150 = 1350
    assert result.claimed_total == 1350.00
    # Approved total: all under benchmark
    assert result.approved_total == 1350.00
    assert result.disallowed_total == 0.00
    # Net payout: 1350 - 500 = 850
    assert result.net_payout == 850.00
    assert result.limit_applied is False


def test_benchmark_capping_and_disallowed_costs():
    line_items = [
        # Benchmark max for front bumper is 650, claiming 950 -> disallowed 300
        {"description": "Front Bumper Cover", "claimed_cost": 950.00, "category": "parts"},
        # Benchmark max hourly rate for body labor is 80, claiming 120/hr for 5 hrs = 600 -> capped to 5*80 = 400
        {"description": "Body Labor", "claimed_cost": 600.00, "category": "labor", "hours": 5.0, "hourly_rate": 120.00},
    ]
    coverage_limit = 50000.00
    deductible = 500.00

    result = calculate_payout(line_items, coverage_limit, deductible)

    assert result.claimed_total == 1550.00
    assert result.approved_total == 1050.00  # 650 + 400
    assert result.disallowed_total == 500.00
    # Net payout: 1050 - 500 = 550
    assert result.net_payout == 550.00


def test_deductible_exceeds_approved_cost():
    line_items = [
        {"description": "Side Mirror Glass", "claimed_cost": 120.00, "category": "parts"}
    ]
    coverage_limit = 50000.00
    deductible = 500.00

    result = calculate_payout(line_items, coverage_limit, deductible)
    # Approved is 120, deductible 500 -> net payout must be clamped to 0.0, never negative
    assert result.net_payout == 0.00


def test_coverage_limit_capping():
    line_items = [
        {"description": "Custom Exotic Parts", "claimed_cost": 60000.00, "category": "parts"}
    ]
    coverage_limit = 25000.00
    deductible = 1000.00

    result = calculate_payout(line_items, coverage_limit, deductible)
    assert result.limit_applied is True
    # min(60000, 25000) - 1000 = 24000
    assert result.net_payout == 24000.00
