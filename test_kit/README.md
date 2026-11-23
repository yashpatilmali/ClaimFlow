# ClaimFlow AI Test Kit

A production-grade, zero-cost test suite with 19 pre-generated synthetic claim packets (TC01–TC19).

## Quick Setup (5 Minutes)

1. **Verify Backend is Running:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
2. **Run Automated Smoke Test:**
   ```bash
   python scripts/smoke_test.py
   ```
   This submits every packet through the API, performs the adjuster action, and verifies all 19 assertions.

3. **Or Run Directly from the Web UI:**
   Open [http://localhost:5173/test-lab](http://localhost:5173/test-lab) to inspect, load, and run any packet.

## Test Packet Directory Structure
```
test_kit/
  README.md            Start here
  TEST_CHECKLIST.md    Manual printable test checklist
  test_matrix.csv      CSV export for spreadsheets
  api/
    claimflow.postman_collection.json
    claimflow.http
  packets/
    TC01_clean_bumper_stp/
      claim.json       Form parameters (policy number, loss date, VIN)
      narrative.txt    Claimant incident description
      invoice.pdf      SPECIMEN watermarked repair invoice
      expected.json    Target status, net payout, and fraud band
    ... TC02 through TC19 ...
```

## Summary of Test Cases
- **TC01–TC04:** The 4 featured demo scenarios (STP Auto-approve, Street Racing Exclusion, Recent Inception Fraud, Commercial Truck Subrogation).
- **TC05–TC10:** Core business rules (invoice math self-check, expired policy terms, DUI/rideshare/intentional exclusions, Comprehensive Plus hail damage).
- **TC11–TC15:** Financial boundary and benchmark tests ($2,000 threshold boundary, sub-deductible $0 payout, policy limit capping, benchmark capping).
- **TC16–TC19:** Security, duplicate detection, PII redaction, and error resilience.
