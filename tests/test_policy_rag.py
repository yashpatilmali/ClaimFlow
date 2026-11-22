import pytest
from app.tools.rag_engine import policy_rag


def test_clean_coverage_valid_dates():
    result = policy_rag.verify_coverage(
        policy_number="POL-882910",
        incident_date_str="2026-11-08",
        loss_type="Collision",
        narrative="Bumped into a parking post at 5 mph.",
        policy_effective_date="2026-01-01",
        policy_expiration_date="2027-01-01"
    )
    assert result["is_covered"] is True
    assert result["is_policy_active"] is True
    assert result["deductible"] == 500.0
    assert len(result["citations"]) >= 1
    assert "Section 1.A" in result["citations"][0]["section_ref"]


def test_street_racing_exclusion():
    # Scenario 2: Street racing exclusion
    result = policy_rag.verify_coverage(
        policy_number="POL-882910",
        incident_date_str="2026-11-10",
        loss_type="Collision",
        narrative="I was participating in an impromptu street racing drag pull on Industrial Parkway.",
        policy_effective_date="2026-01-01",
        policy_expiration_date="2027-01-01"
    )
    assert result["is_covered"] is False
    assert result["is_policy_active"] is True
    assert len(result["citations"]) >= 1
    assert "Section 3.B" in result["citations"][0]["section_ref"]
    assert "racing" in result["citations"][0]["quote"].lower()


def test_inactive_policy_date():
    result = policy_rag.verify_coverage(
        policy_number="POL-882910",
        incident_date_str="2025-05-15",
        loss_type="Collision",
        narrative="Accident happened before policy started.",
        policy_effective_date="2026-01-01",
        policy_expiration_date="2027-01-01"
    )
    assert result["is_covered"] is False
    assert result["is_policy_active"] is False
