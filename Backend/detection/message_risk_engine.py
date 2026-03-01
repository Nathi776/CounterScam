import re
from typing import Dict

from detection.risk_engine import calculate_risk_score, _ml_phishing_probability

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
    url_regex = r"(https?://[^\s]+)"
    return re.findall(url_regex, message)


def calculate_message_risk_score(message: str, msg_pipe, url_pipe) -> Dict:
    score = 0
    reasons = []

    msg_lower = message.lower()

    # OTP-safe detection
    if any(p in msg_lower for p in OTP_SAFE_PATTERNS):
        score -= 20
        reasons.append("OTP-style message detected (usually safe)")

    # High-risk patterns
    for pattern in HIGH_RISK_PATTERNS:
        if pattern in msg_lower:
            score += 40
            reasons.append(f"High-risk phrase detected: '{pattern}'")

    # Medium-risk patterns
    for pattern in MEDIUM_RISK_PATTERNS:
        if pattern in msg_lower:
            score += 20
            reasons.append(f"Suspicious phrase detected: '{pattern}'")

    # Scan URLs inside message
    for url in extract_urls(message):
        url_result = calculate_risk_score(url, url_pipe)
        if url_result["risk_score"] >= 40:
            score += min(url_result["risk_score"], 60)
            reasons.append(f"Suspicious URL detected: {url}")

    # ML for message text
    try:
        p = msg_pipe.predict_proba([message])[0][1]
        ml_score = int(round(p * 100))

        if ml_score >= 85:
            score += 55
            reasons.append(f"ML strongly indicates scam message (p={p:.2f})")
        elif ml_score >= 60:
            score += 30
            reasons.append(f"ML indicates suspicious message (p={p:.2f})")
        elif ml_score >= 40:
            score += 10
            reasons.append(f"ML sees mild risk in message (p={p:.2f})")
        else:
            reasons.append(f"ML sees low risk in message (p={p:.2f})")

    except Exception as e:
        score += 10
        reasons.append(f"ML check unavailable (model/vectorizer issue): {e}")

    score = max(0, min(score, 100))

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