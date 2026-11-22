import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "ClaimFlow AI" in data["service"]


def test_get_demo_scenarios():
    resp = client.get("/api/scenarios")
    assert resp.status_code == 200
    scenarios = resp.json()
    assert len(scenarios) == 4
    ids = [s["scenario_id"] for s in scenarios]
    assert "scenario_1" in ids
    assert "scenario_2" in ids
    assert "scenario_3" in ids
    assert "scenario_4" in ids


def test_execute_scenario_1_via_api():
    resp = client.post("/api/scenarios/scenario_1/execute")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "APPROVED_STP"
    assert data["financials"]["net_payout"] == 850.00
    assert data["fraud_risk_score"] < 30.0


def test_execute_scenario_2_and_resolve_hitl():
    # 1. Execute Scenario 2 (Street racing exclusion)
    resp = client.post("/api/scenarios/scenario_2/execute")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "PENDING_HITL"
    assert data["is_paused"] is True
    claim_number = data["claim_number"]

    # 2. Check queue
    queue_resp = client.get("/api/hitl/queue")
    assert queue_resp.status_code == 200
    queue = queue_resp.json()
    assert any(q["claim_number"] == claim_number for q in queue)

    # 3. Submit Adjuster Denial Decision
    dec_resp = client.post(
        f"/api/hitl/{claim_number}/decision",
        json={
            "adjuster_id": "ADJ-TEST-99",
            "decision": "DENY",
            "audit_note": "Confirmed street racing violation under Section 3.B. Denial affirmed."
        }
    )
    assert dec_resp.status_code == 200
    dec_data = dec_resp.json()
    assert dec_data["status"] == "RESOLVED_DENY"
    assert dec_data["final_payout"] == 0.0


def test_dashboard_kpis():
    resp = client.get("/api/dashboard/kpis")
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert "stp_rate_percentage" in data["summary"]
    assert "trend_series" in data
    assert "distribution" in data
