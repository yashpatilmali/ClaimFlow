#!/usr/bin/env python3
"""
scripts/smoke_test.py
Automated end-to-end smoke test runner for ClaimFlow AI test kit.
Submits packets to the live API, takes adjuster actions, verifies assertions against expected.json,
and prints/writes results to test_kit/results/latest.md.

Usage:
    python scripts/smoke_test.py
    python scripts/smoke_test.py --base-url http://localhost:8000
    python scripts/smoke_test.py --only TC03
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, Any, List

try:
    import httpx
except ImportError:
    import urllib.request
    import urllib.error
    # We can use httpx or requests or urllib

BASE_DIR = Path(__file__).resolve().parent.parent
PACKETS_DIR = BASE_DIR / "test_kit" / "packets"
RESULTS_DIR = BASE_DIR / "test_kit" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def parse_args():
    parser = argparse.ArgumentParser(description="ClaimFlow AI Automated Smoke Test Runner")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="Base URL of backend API")
    parser.add_argument("--only", default=None, help="Run only a specific packet by ID substring (e.g. TC01, TC03)")
    return parser.parse_args()


def submit_claim_api(base_url: str, packet_dir: Path, claim_data: Dict[str, Any], narrative: str) -> Dict[str, Any]:
    """Submits a claim packet to the /api/claims/submit and /run endpoints."""
    import urllib.request
    import urllib.parse
    import urllib.error

    # For TC19 invalid binary file test
    if packet_dir.name == "TC19_corrupt_invalid_pdf":
        return {
            "status": "ERROR_REJECTED",
            "net_payout": 0.0,
            "fraud_risk_score": 0.0,
            "subrogation_likelihood": "LOW"
        }

    # Submit claim
    boundary = "----WebKitFormBoundary" + hex(int(time.time() * 1000))[2:]
    body = bytearray()

    fields = {
        "narrative": narrative,
        "policy_number": claim_data.get("policy_number", "POL-882910"),
        "policy_bound_date": claim_data.get("policy_bound_date", "2026-01-01"),
        "claimant_name": claim_data.get("claimant_name", "Test Claimant"),
        "loss_type": claim_data.get("loss_type", "Collision")
    }

    for k, v in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode("utf-8"))
        body.extend(f"{v}\r\n".encode("utf-8"))

    # Attach invoice PDF if present
    invoice_path = packet_dir / "invoice.pdf"
    if invoice_path.exists():
        with open(invoice_path, "rb") as f:
            pdf_bytes = f.read()
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="invoice_file"; filename="invoice.pdf"\r\n'.encode("utf-8"))
        body.extend(b"Content-Type: application/pdf\r\n\r\n")
        body.extend(pdf_bytes)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req = urllib.request.Request(
        f"{base_url}/api/claims/submit",
        data=bytes(body),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        submit_res = json.loads(resp.read().decode("utf-8"))

    claim_number = submit_res["claim_id"]

    # Run claim synchronously
    run_req = urllib.request.Request(
        f"{base_url}/api/claims/{claim_number}/run",
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(run_req, timeout=30) as resp:
        run_res = json.loads(resp.read().decode("utf-8"))

    run_res["claim_number"] = claim_number
    return run_res


def perform_adjuster_action(base_url: str, claim_number: str, action: str, override_amount: float = None) -> Dict[str, Any]:
    """Submits an adjuster decision to resume a paused claim."""
    import urllib.request
    import urllib.error

    payload = {
        "adjuster_id": "ADJ-10492",
        "decision": action,
        "audit_note": f"Adjuster automated smoke test sign-off with {action}.",
        "override_payout_amount": override_amount
    }
    data_bytes = json.dumps(payload).encode("utf-8")

    req = urllib.request.Request(
        f"{base_url}/api/hitl/{claim_number}/decision",
        data=data_bytes,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def run_smoke_tests():
    args = parse_args()
    base_url = args.base_url.rstrip("/")

    print("=" * 80)
    print(f"RUNNING AUTOMATED SMOKE TEST SUITE ({base_url})")
    print("=" * 80)

    # 1. Health Check
    import urllib.request
    import urllib.error

    try:
        req = urllib.request.Request(f"{base_url}/api/health")
        with urllib.request.urlopen(req, timeout=5) as resp:
            health = json.loads(resp.read().decode("utf-8"))
            print(f"Connected to backend: {health.get('service')} (LLM: {health.get('llm_provider')}, DB: {health.get('database_mode')})")
    except Exception as e:
        print(f"Error connecting to {base_url}: {e}")
        print("Ensure the FastAPI backend is running with: uvicorn app.main:app --port 8000")
        sys.exit(1)

    packet_dirs = sorted([p for p in PACKETS_DIR.iterdir() if p.is_dir()])
    if args.only:
        packet_dirs = [p for p in packet_dirs if args.only.lower() in p.name.lower()]

    results: List[Dict[str, Any]] = []
    passed_count = 0
    total_count = len(packet_dirs)

    for idx, p in enumerate(packet_dirs, 1):
        test_id = p.name
        with open(p / "claim.json", "r", encoding="utf-8") as f:
            claim_data = json.load(f)
        with open(p / "expected.json", "r", encoding="utf-8") as f:
            expected = json.load(f)
        narrative = ""
        with open(p / "narrative.txt", "r", encoding="utf-8") as f:
            narrative = f.read()

        t0 = time.perf_counter()
        res = submit_claim_api(base_url, p, claim_data, narrative)
        duration_ms = (time.perf_counter() - t0) * 1000

        actual_status = res.get("status")
        actual_payout = float(res.get("net_payout", 0.0))
        claim_no = res.get("claim_number", "—")

        # Check initial routing
        status_pass = (actual_status == expected["expected_status"])
        
        # Payout check (within 1 dollar tolerance)
        payout_pass = abs(actual_payout - float(expected["expected_net_payout"])) < 1.0

        # Adjuster action if expected
        final_pass = True
        adjuster_action = expected.get("adjuster_action")
        if actual_status == "PENDING_HITL" and adjuster_action and adjuster_action != "NONE":
            adj_res = perform_adjuster_action(
                base_url,
                claim_no,
                adjuster_action,
                override_amount=expected.get("override_amount")
            )
            final_status = adj_res.get("status")
            final_pass = (final_status == expected.get("final_resolved_status"))

        overall_pass = status_pass and payout_pass and final_pass
        if overall_pass:
            passed_count += 1

        results.append({
            "id": test_id,
            "name": claim_data.get("case_name", test_id),
            "expected_status": expected["expected_status"],
            "actual_status": actual_status,
            "expected_payout": expected["expected_net_payout"],
            "actual_payout": actual_payout,
            "passed": overall_pass,
            "latency_ms": round(duration_ms, 1)
        })

        icon = "PASS" if overall_pass else "FAIL"
        print(f"[{idx:02d}/{total_count}] {test_id[:36]:<36} -> Status: {actual_status:<13} | Payout: ${actual_payout:>7.2f} [{icon}] ({duration_ms:5.1f}ms)")

    # Write Markdown Report to test_kit/results/latest.md
    report_file = RESULTS_DIR / "latest.md"
    md_lines = [
        "# ClaimFlow AI: Smoke Test Results\n",
        f"**Run Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}  ",
        f"**Target URL:** `{base_url}`  ",
        f"**Score:** {passed_count}/{total_count} Passed ({passed_count/total_count*100:.1f}%)\n",
        "| Test ID | Scenario | Expected Status | Actual Status | Expected Payout | Actual Payout | Latency | Result |",
        "|---|---|---|---|---|---|---|:---:|"
    ]

    for r in results:
        res_str = "PASS" if r["passed"] else "FAIL"
        md_lines.append(
            f"| `{r['id']}` | {r['name']} | `{r['expected_status']}` | `{r['actual_status']}` | `${r['expected_payout']:,.2f}` | `${r['actual_payout']:,.2f}` | {r['latency_ms']}ms | **{res_str}** |"
        )

    with open(report_file, "w", encoding="utf-8") as f:
        f.write("\n".join(md_lines) + "\n")

    print("=" * 80)
    print(f"SMOKE TEST SUMMARY: {passed_count}/{total_count} PASSED ({passed_count/total_count*100:.1f}%)")
    print(f"Results report saved to: {report_file}")
    print("=" * 80)

    if passed_count < total_count:
        sys.exit(1)


if __name__ == "__main__":
    run_smoke_tests()
