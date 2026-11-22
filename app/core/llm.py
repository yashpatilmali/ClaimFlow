import os
import json
import time
import logging
from typing import Any, Dict, List, Optional, Type
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger("claimflow.llm")


class MockAIMessage:
    def __init__(self, content: str):
        self.content = content


class MockLLM:
    """
    Deterministic offline Mock LLM for offline testing, evals, and CI without API keys.
    Inspects input prompts and provides rich, schema-compliant responses for each agent.
    """

    def __init__(self, model_name: str = "mock-insurance-adjudicator"):
        self.model_name = model_name

    def invoke(self, messages: Any, **kwargs) -> MockAIMessage:
        prompt_text = ""
        if isinstance(messages, str):
            prompt_text = messages
        elif isinstance(messages, list):
            prompt_text = " ".join([m.content if hasattr(m, "content") else str(m) for m in messages])
        else:
            prompt_text = str(messages)

        logger.info(f"[MockLLM] Invoked with prompt preview: {prompt_text[:120]}...")
        resp_json = self._route_mock_response(prompt_text)
        return MockAIMessage(content=resp_json)

    def _route_mock_response(self, text: str) -> str:
        text_lower = text.lower()

        # Prompt injection test check: examine body excluding system instructions
        body_to_check = text_lower
        if "<security_instructions>" in text_lower and "</security_instructions>" in text_lower:
            idx1 = text_lower.find("<security_instructions>")
            idx2 = text_lower.find("</security_instructions>") + len("</security_instructions>")
            body_to_check = text_lower[:idx1] + text_lower[idx2:]

        if "ignore all rules" in body_to_check or "approve $50,000" in body_to_check or "system override" in body_to_check:
            return json.dumps({
                "error": "Adversarial prompt injection pattern detected and rejected",
                "fraud_risk_score": 95.0,
                "is_covered": False,
                "rejection_reason": "Policy violation and adversarial prompt injection attempt detected."
            })

        # 1. Intake Agent queries
        if "intake" in text_lower or "fnol" in text_lower or "repair invoice" in text_lower or "untrusted_invoice_text" in text_lower:
            # Check for Scenario 2 (racing)
            if "street racing" in text_lower or "nitrous" in text_lower or "drag strip" in text_lower:
                return json.dumps({
                    "incident_date": "2026-11-10",
                    "loss_type": "Collision",
                    "vehicle_vin": "1HGCR2F83HA001234",
                    "damaged_parts": ["Radiator Support", "Front Bumper", "Engine Intercooler"],
                    "line_items": [
                        {"description": "Front Bumper Cover", "category": "parts", "claimed_cost": 650.00},
                        {"description": "Engine Intercooler", "category": "parts", "claimed_cost": 1200.00},
                        {"description": "Body Labor", "category": "labor", "claimed_cost": 850.00, "hours": 10.0, "hourly_rate": 85.00},
                        {"description": "Paint Labor", "category": "paint", "claimed_cost": 500.00, "hours": 6.25, "hourly_rate": 80.00}
                    ],
                    "claimed_amount": 3200.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "Claimant vehicle sustained front-end damage during a street racing contest."
                })
            # Scenario 3 (Suspicious Fraud / Roof mismatch)
            elif "roof" in text_lower or ("mirror" in text_lower and ("6800" in text_lower or "unsubstantiated" in text_lower or "discrepancy" in text_lower or "mailbox" in text_lower)):
                return json.dumps({
                    "incident_date": "2026-11-12",
                    "loss_type": "Comprehensive",
                    "vehicle_vin": "3FA6P0H78HR109876",
                    "damaged_parts": ["Side Mirror Assembly", "Roof Panel", "Frame Rail"],
                    "line_items": [
                        {"description": "Side Mirror Assembly", "category": "parts", "claimed_cost": 350.00},
                        {"description": "Roof Panel Assembly", "category": "parts", "claimed_cost": 2800.00},
                        {"description": "Frame Alignment Labor", "category": "labor", "claimed_cost": 2400.00, "hours": 16.0, "hourly_rate": 150.00},
                        {"description": "Paint Labor", "category": "paint", "claimed_cost": 1250.00, "hours": 12.5, "hourly_rate": 100.00}
                    ],
                    "claimed_amount": 6800.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "Narrative mentions minor mailbox clip damaging side mirror, but invoice claims full roof replacement."
                })
            # Scenario 4 (Subrogation / Commercial Truck)
            elif "commercial truck" in text_lower or "semi-truck" in text_lower or "rear-ended" in text_lower:
                return json.dumps({
                    "incident_date": "2026-11-05",
                    "loss_type": "Collision",
                    "vehicle_vin": "1G1BE5SM7H7123987",
                    "damaged_parts": ["Rear Bumper Cover", "Trunk Lid", "Tail Light"],
                    "line_items": [
                        {"description": "Rear Bumper Cover", "category": "parts", "claimed_cost": 600.00},
                        {"description": "Trunk Lid Assembly", "category": "parts", "claimed_cost": 900.00},
                        {"description": "Body Labor", "category": "labor", "claimed_cost": 600.00, "hours": 7.5, "hourly_rate": 80.00},
                        {"description": "Paint Labor", "category": "paint", "claimed_cost": 300.00, "hours": 4.0, "hourly_rate": 75.00}
                    ],
                    "claimed_amount": 2400.00,
                    "third_party_involved": True,
                    "third_party_info": {
                        "party_name": "Apex Freight Logistics Inc.",
                        "driver_name": "Marcus Vance",
                        "insurance_carrier": "Great American Commercial",
                        "policy_number": "COMM-981245",
                        "citation_issued": "Failure to stop at red light (Police Citation #TR-88192)"
                    },
                    "math_reconciliation_valid": True,
                    "notes": "Claimant stationary at red light; rear-ended by commercial freight vehicle. Clear third-party liability."
                })
            # High Dollar ($3,600)
            elif "3600" in text_lower or "3,600" in text_lower:
                return json.dumps({
                    "incident_date": "2026-11-08",
                    "loss_type": "Collision",
                    "vehicle_vin": "4T1B11HK5JU543210",
                    "damaged_parts": ["Front Bumper", "Hood", "Lower Grille"],
                    "line_items": [
                        {"description": "Front Bumper Cover", "category": "parts", "claimed_cost": 650.00},
                        {"description": "Hood", "category": "parts", "claimed_cost": 800.00},
                        {"description": "Lower Grille Assembly", "category": "parts", "claimed_cost": 250.00},
                        {"description": "Body Labor", "category": "labor", "claimed_cost": 1200.00, "hours": 15.0, "hourly_rate": 80.00},
                        {"description": "Paint Labor", "category": "paint", "claimed_cost": 700.00, "hours": 9.33, "hourly_rate": 75.00}
                    ],
                    "claimed_amount": 3600.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "High-dollar impact against parking garage structural barrier."
                })
            # Windshield / Glass Comprehensive
            elif "windshield" in text_lower or "pebble" in text_lower:
                return json.dumps({
                    "incident_date": "2026-11-08",
                    "loss_type": "Comprehensive",
                    "vehicle_vin": "4T1B11HK5JU543210",
                    "damaged_parts": ["Windshield Glass"],
                    "line_items": [
                        {"description": "Windshield", "category": "parts", "claimed_cost": 550.00}
                    ],
                    "claimed_amount": 550.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "Highway pebble impact cracked windshield glass."
                })
            # Sub-Deductible Minor Item ($220)
            elif "220" in text_lower or "branch" in text_lower or "carport" in text_lower:
                return json.dumps({
                    "incident_date": "2026-11-08",
                    "loss_type": "Collision",
                    "vehicle_vin": "4T1B11HK5JU543210",
                    "damaged_parts": ["Side Mirror Glass"],
                    "line_items": [
                        {"description": "Side Mirror Glass", "category": "parts", "claimed_cost": 220.00}
                    ],
                    "claimed_amount": 220.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "Minor scrape against tree branch."
                })
            # Scenario 1 (Clean STP) / Default
            else:
                return json.dumps({
                    "incident_date": "2026-11-08",
                    "loss_type": "Collision",
                    "vehicle_vin": "4T1B11HK5JU543210",
                    "damaged_parts": ["Front Bumper Cover", "Lower Grille"],
                    "line_items": [
                        {"description": "Front Bumper Cover", "category": "parts", "claimed_cost": 650.00},
                        {"description": "Lower Grille Assembly", "category": "parts", "claimed_cost": 250.00},
                        {"description": "Body Labor", "category": "labor", "claimed_cost": 300.00, "hours": 3.75, "hourly_rate": 80.00},
                        {"description": "Paint Labor", "category": "paint", "claimed_cost": 150.00, "hours": 2.0, "hourly_rate": 75.00}
                    ],
                    "claimed_amount": 1350.00,
                    "third_party_involved": False,
                    "third_party_info": None,
                    "math_reconciliation_valid": True,
                    "notes": "Low-speed parking lot collision with post. Minor front bumper damage."
                })

        # 2. Policy Agent queries
        if "policy_agent" in text_lower or "coverage" in text_lower or "exclusion" in text_lower:
            if "racing" in text_lower or "drag strip" in text_lower or "speed contest" in text_lower:
                return json.dumps({
                    "is_covered": False,
                    "coverage_type": "Collision",
                    "coverage_limit": 50000.00,
                    "deductible": 500.00,
                    "is_policy_active": True,
                    "citations": [
                        {
                            "section_ref": "Section 3.B - Specific Exclusions",
                            "page_num": 4,
                            "quote": "This policy does not provide coverage for any loss or damage occurring while the insured vehicle is engaged in, practicing for, or participating in any prearranged or organized racing, speed contest, or stunting activity."
                        }
                    ],
                    "coverage_decision_rationale": "Loss occurred during street racing/speed contest which is expressly excluded under Section 3.B of the standard auto policy."
                })
            else:
                return json.dumps({
                    "is_covered": True,
                    "coverage_type": "Collision",
                    "coverage_limit": 50000.00,
                    "deductible": 500.00,
                    "is_policy_active": True,
                    "citations": [
                        {
                            "section_ref": "Section 1.A - Collision Coverage",
                            "page_num": 2,
                            "quote": "We will pay for direct and accidental loss to your covered auto caused by collision with another object or upset of the covered auto, less the applicable deductible."
                        }
                    ],
                    "coverage_decision_rationale": "Active collision coverage in place with $500 deductible and $50,000 limit. Incident date is within effective policy period."
                })

        # 3. Fraud Agent queries
        if "fraud_agent" in text_lower or "fraud" in text_lower or "siu" in text_lower:
            if "roof" in text_lower or "mirror" in text_lower or "4 days" in text_lower:
                return json.dumps({
                    "fraud_risk_score": 82.5,
                    "ml_model_probability": 0.84,
                    "rule_flags": [
                        "POLICY_BOUND_RECENTLY: Policy was bound within 15 days prior to incident (4 days)",
                        "INVOICE_NARRATIVE_DISCREPANCY: Narrative describes minor side mirror brush; invoice bills $5,200 for roof and frame replacement",
                        "EXCESSIVE_LABOR_HOURS: Frame labor hours deviate > 300% from vehicle impact severity"
                    ],
                    "risk_drivers": [
                        "Severe discrepancy between claimant narrative and repair facility line items",
                        "High loss-to-inception proximity (4 days post-binding)",
                        "Unsubstantiated frame and roof replacement on single-point impact"
                    ],
                    "recommendation": "REFER_SIU"
                })
            else:
                return json.dumps({
                    "fraud_risk_score": 12.0,
                    "ml_model_probability": 0.11,
                    "rule_flags": [],
                    "risk_drivers": ["Normal incident timeline", "Parts aligned with impact description", "VIN and invoice hash verified"],
                    "recommendation": "LOW_RISK"
                })

        # 4. Subrogation Agent queries
        if "subrogation" in text_lower or "recovery" in text_lower or "third-party" in text_lower:
            if "commercial truck" in text_lower or "semi-truck" in text_lower or "rear-ended" in text_lower or "freight" in text_lower:
                return json.dumps({
                    "subrogation_likelihood": "HIGH",
                    "fault_score": 98.0,
                    "identified_third_party": {
                        "carrier": "Great American Commercial",
                        "entity": "Apex Freight Logistics Inc.",
                        "driver": "Marcus Vance",
                        "policy_number": "COMM-981245",
                        "police_report_citation": "TR-88192 - Failure to stop at red signal"
                    },
                    "estimated_recovery_amount": 1900.00,
                    "referral_brief": "Clear liability established. Insured was stopped at red signal when struck from behind by commercial freight carrier. Police citation confirms third-party driver fault. Immediate subrogation demand packet recommended to commercial carrier."
                })
            else:
                return json.dumps({
                    "subrogation_likelihood": "LOW",
                    "fault_score": 10.0,
                    "identified_third_party": None,
                    "estimated_recovery_amount": 0.0,
                    "referral_brief": "Single-vehicle collision with stationary object or no identifiable solvent third party. Subrogation recovery not viable."
                })

        # 5. Adjudication & Settlement Letter queries
        return json.dumps({
            "summary": "Automated adjudication assessment complete.",
            "settlement_letter": "Dear Policyholder, your auto insurance claim has been reviewed and adjudicated pursuant to policy terms and benchmark repair standards.",
            "guidewire_sync_status": "READY"
        })


def get_llm(temperature: float = 0.0):
    """
    LLM Provider Factory:
    Priority:
    1. If MOCK_LLM=true -> MockLLM (zero-cost, 100% deterministic, offline)
    2. Primary: Google Gemini (`ChatGoogleGenerativeAI`)
    3. Fallback 1: Groq (`ChatGroq`)
    4. Fallback 2: Ollama (`ChatOllama`)
    """
    if settings.MOCK_LLM:
        logger.info("Using deterministic MockLLM provider (offline mode)")
        return MockLLM()

    # Try Primary: Gemini
    if settings.GEMINI_API_KEY:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            logger.info(f"Using Google Gemini API provider with model: {settings.GEMINI_MODEL}")
            return ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                temperature=temperature,
                google_api_key=settings.GEMINI_API_KEY,
                max_retries=3,
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGoogleGenerativeAI: {e}. Falling back...")

    # Fallback 1: Groq
    if settings.GROQ_API_KEY:
        try:
            from langchain_groq import ChatGroq
            logger.info(f"Using Groq API provider with model: {settings.GROQ_MODEL}")
            return ChatGroq(
                model_name=settings.GROQ_MODEL,
                temperature=temperature,
                groq_api_key=settings.GROQ_API_KEY,
                max_retries=3,
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGroq: {e}. Falling back...")

    # Fallback 2: Ollama
    try:
        from langchain_community.chat_models import ChatOllama
        logger.info(f"Using local Ollama provider at {settings.OLLAMA_BASE_URL}")
        return ChatOllama(
            base_url=settings.OLLAMA_BASE_URL,
            model=settings.OLLAMA_MODEL,
            temperature=temperature,
        )
    except Exception as e:
        logger.warning(f"Failed to initialize ChatOllama: {e}. Defaulting to MockLLM.")

    return MockLLM()
