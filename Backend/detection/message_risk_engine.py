import re
from typing import Dict

from detection.risk_engine import calculate_risk_score
from ml.model import detect_with_ml

# High-risk social engineering patterns
HIGH_RISK_PATTERNS = [
    "verify your account",
    "confirm your identity",
    "account will be blocked",
    "account suspended",
    "urgent action required",
    "click here immediately",
    "login now",
    "unauthorized login attempt",
    "security alert",
]

MEDIUM_RISK_PATTERNS = [
    "click here",
    "update your account",
    "reset your password",
    "verify now",
    "limited time",
]

OTP_SAFE_PATTERNS = [
    "your otp is",
    "one-time password",
    "do not share this code",
]


def extract_urls(message: str):
    url_regex = r'(https?://[^\s]+)'
    return re.findall(url_regex, message)


def calculate_message_risk_score(message: str, vectorizer, model) -> Dict:

    score = 0
    reasons = []

    msg_lower = message.lower()

    # OTP SAFE DETECTION (reduce score)
    if any(pattern in msg_lower for pattern in OTP_SAFE_PATTERNS):
        score -= 20
        reasons.append("OTP-style message detected (usually safe)")

    # High Risk Social Engineering
    for pattern in HIGH_RISK_PATTERNS:
        if pattern in msg_lower:
            score += 40
            reasons.append(f"High-risk phrase detected: '{pattern}'")

    # Medium Risk Patterns
    for pattern in MEDIUM_RISK_PATTERNS:
        if pattern in msg_lower:
            score += 20
            reasons.append(f"Suspicious phrase detected: '{pattern}'")

    # URL Detection and Scan
    urls = extract_urls(message)

    for url in urls:

        url_result = calculate_risk_score(
            url,
            vectorizer,
            model
        )

        if url_result["risk_score"] >= 40:
            score += url_result["risk_score"]
            reasons.append(f"Suspicious URL detected: {url}")

    # ML Detection
    try:
        ml_pred = detect_with_ml(message, vectorizer, model)
        is_phishing = (ml_pred == 1) or (str(ml_pred).lower() in ["phishing", "scam", "malicious"])

        if is_phishing:
            score += 40
            reasons.append("ML model detected phishing message pattern")

    except Exception as e:
        print("ML error:", e)

    # Normalize score
    score = max(score, 0)

    # Final verdict
    if score >= 80:
        verdict = "phishing"
        confidence = 0.95

    elif score >= 40:
        verdict = "suspicious"
        confidence = 0.75

    else:
        verdict = "safe"
        confidence = 0.95

    return {

        "risk_score": score,
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons if reasons else ["No phishing indicators detected"]

    }
