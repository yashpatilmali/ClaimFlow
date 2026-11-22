import re
from typing import Tuple, Dict, Any


class PIIRedactor:
    """
    Local PII redaction gate using regex and pattern matching.
    Masks phones, emails, SSNs, policy IDs, and VINs BEFORE any text
    is sent to external LLMs, preserving a secure token map to unmask
    only in trusted UI responses or audited databases.
    """

    PATTERNS = {
        "SSN": re.compile(r"\b(\d{3}-\d{2}-\d{4})\b"),
        "PHONE": re.compile(r"\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b"),
        "EMAIL": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
        "POLICY_ID": re.compile(r"\b(?:POL|PA|PL|AUTO)-[A-Z0-9]{5,10}\b", re.IGNORECASE),
        "VIN": re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b"),
    }

    def __init__(self):
        pass

    def redact(self, text: str) -> Tuple[str, Dict[str, str]]:
        """
        Scans text for sensitive PII entities, replaces them with deterministic tokens
        (e.g., [SSN_1], [PHONE_1]), and returns (redacted_text, token_map).
        """
        if not text:
            return "", {}

        token_map: Dict[str, str] = {}
        redacted_text = text
        counters: Dict[str, int] = {}

        for pii_type, pattern in self.PATTERNS.items():
            matches = list(pattern.finditer(redacted_text))
            # Sort matches in reverse order so replacement indices remain stable
            for match in sorted(matches, key=lambda m: m.start(), reverse=True):
                original_val = match.group(0)
                # Check if this exact value was already assigned a token
                existing_token = None
                for tok, orig in token_map.items():
                    if orig == original_val:
                        existing_token = tok
                        break

                if not existing_token:
                    counters[pii_type] = counters.get(pii_type, 0) + 1
                    token = f"[{pii_type}_{counters[pii_type]}]"
                    token_map[token] = original_val
                else:
                    token = existing_token

                start, end = match.span()
                redacted_text = redacted_text[:start] + token + redacted_text[end:]

        return redacted_text, token_map

    def unmask(self, text: str, token_map: Dict[str, str]) -> str:
        """
        Replaces tokens back with their original sensitive values for authorized UI views.
        """
        if not text or not token_map:
            return text

        unmasked_text = text
        for token, original_val in token_map.items():
            unmasked_text = unmasked_text.replace(token, original_val)
        return unmasked_text


# Global default instance
pii_redactor = PIIRedactor()
