import pytest
from app.tools.pii_redactor import pii_redactor


def test_pii_redaction_and_unmasking():
    original_text = (
        "Claimant John Doe (SSN: 123-45-6789, Email: john.doe@example.com, Phone: 555-123-4567) "
        "reports accident under Policy POL-882910 for vehicle with VIN 1HGCR2F83HA001234."
    )

    redacted_text, token_map = pii_redactor.redact(original_text)

    # Assert all sensitive entities are masked
    assert "123-45-6789" not in redacted_text
    assert "john.doe@example.com" not in redacted_text
    assert "555-123-4567" not in redacted_text
    assert "POL-882910" not in redacted_text
    assert "1HGCR2F83HA001234" not in redacted_text

    # Assert structured tokens exist
    assert "[SSN_1]" in redacted_text
    assert "[EMAIL_1]" in redacted_text
    assert "[PHONE_1]" in redacted_text
    assert "[POLICY_ID_1]" in redacted_text
    assert "[VIN_1]" in redacted_text

    # Verify token map contains original values
    assert token_map["[SSN_1]"] == "123-45-6789"
    assert token_map["[EMAIL_1]"] == "john.doe@example.com"
    assert token_map["[PHONE_1]"] == "555-123-4567"
    assert token_map["[POLICY_ID_1]"] == "POL-882910"
    assert token_map["[VIN_1]"] == "1HGCR2F83HA001234"

    # Test complete unmasking
    restored = pii_redactor.unmask(redacted_text, token_map)
    assert restored == original_text
