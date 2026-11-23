import os
import json
import zipfile
import io
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/api/test-kit", tags=["test-kit"])

TEST_KIT_DIR = Path("test_kit")
PACKETS_DIR = TEST_KIT_DIR / "packets"


@router.get("/packets")
def list_test_packets() -> List[Dict[str, Any]]:
    """
    Returns the catalog of all 19 test packets with summary metadata,
    expected status, net payout, and demo flag.
    """
    if not PACKETS_DIR.exists():
        return []

    packets = []
    for p in sorted(PACKETS_DIR.iterdir()):
        if not p.is_dir():
            continue
        claim_file = p / "claim.json"
        expected_file = p / "expected.json"
        narrative_file = p / "narrative.txt"

        if not claim_file.exists() or not expected_file.exists():
            continue

        with open(claim_file, "r", encoding="utf-8") as f:
            claim_data = json.load(f)
        with open(expected_file, "r", encoding="utf-8") as f:
            expected_data = json.load(f)
        narrative_text = ""
        if narrative_file.exists():
            with open(narrative_file, "r", encoding="utf-8") as f:
                narrative_text = f.read()

        has_pdf = (p / "invoice.pdf").exists()
        has_police = (p / "police_report.pdf").exists()
        has_photo = (p / "damage_photo.png").exists()

        packets.append({
            "id": p.name,
            "name": claim_data.get("case_name", p.name),
            "story": narrative_text[:120] + ("..." if len(narrative_text) > 120 else ""),
            "full_narrative": narrative_text,
            "policy_number": claim_data.get("policy_number", "POL-882910"),
            "policy_bound_date": claim_data.get("policy_bound_date", "2026-01-01"),
            "incident_date": claim_data.get("incident_date", "2026-11-08"),
            "loss_type": claim_data.get("loss_type", "Collision"),
            "claimant_name": claim_data.get("claimant_name", "Alex Mercer"),
            "vehicle_vin": claim_data.get("vehicle_vin", "4T1B11HK5JU543210"),
            "claimed_amount": claim_data.get("claimed_amount", 0.0),
            "expected_status": expected_data.get("expected_status", "APPROVED_STP"),
            "expected_net_payout": expected_data.get("expected_net_payout", 0.0),
            "expected_fraud_score_band": expected_data.get("expected_fraud_score_band", [0, 29]),
            "expected_subrogation_likelihood": expected_data.get("expected_subrogation_likelihood", "LOW"),
            "adjuster_action": expected_data.get("adjuster_action", "NONE"),
            "final_status": expected_data.get("final_resolved_status", "APPROVED_STP"),
            "is_demo_scenario": claim_data.get("is_demo_scenario", False),
            "has_invoice_pdf": has_pdf,
            "has_police_report": has_police,
            "has_damage_photo": has_photo
        })

    return packets


@router.get("/packets/{packet_id}")
def get_packet_details(packet_id: str) -> Dict[str, Any]:
    """Returns details and file paths for a single test packet."""
    p = PACKETS_DIR / packet_id
    if not p.exists() or not p.is_dir():
        raise HTTPException(status_code=404, detail=f"Packet '{packet_id}' not found")

    claim_file = p / "claim.json"
    expected_file = p / "expected.json"
    narrative_file = p / "narrative.txt"

    with open(claim_file, "r", encoding="utf-8") as f:
        claim_data = json.load(f)
    with open(expected_file, "r", encoding="utf-8") as f:
        expected_data = json.load(f)
    narrative = ""
    if narrative_file.exists():
        with open(narrative_file, "r", encoding="utf-8") as f:
            narrative = f.read()

    return {
        "id": packet_id,
        "claim": claim_data,
        "expected": expected_data,
        "narrative": narrative,
        "files": [f.name for f in p.iterdir() if f.is_file()]
    }


@router.get("/packets/{packet_id}/zip")
def download_packet_zip(packet_id: str):
    """Packages and returns a zip archive of the packet."""
    p = PACKETS_DIR / packet_id
    if not p.exists() or not p.is_dir():
        raise HTTPException(status_code=404, detail=f"Packet '{packet_id}' not found")

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in p.iterdir():
            if file_path.is_file():
                zf.write(file_path, arcname=file_path.name)

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={packet_id}.zip"}
    )
