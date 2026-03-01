from datetime import datetime, timezone
import socket
import whois

from ml.rule_based import has_typosquatting, BLACKLIST_DOMAINS
from detection.domain_utils import extract_domain, is_trusted_domain

socket.setdefaulttimeout(5.0)

GOV_TLDS = [".gov", ".gov.za", ".ac.za", ".mil", ".edu"]


def _ml_phishing_probability(pipe, text: str) -> float:
    """
    Returns phishing probability in [0, 1] using a sklearn Pipeline:
    tfidf + classifier with predict_proba.
    """
    proba = pipe.predict_proba([text])[0][1]
    return float(proba)


def calculate_risk_score(url: str, url_pipe):
    score = 0
    reasons = []

    domain = extract_domain(url)

    # 1) TRUSTED DOMAIN → (keep it safe, but not always 0)
    # NOTE: Returning 0 makes everything look "too safe".
    # We'll still mark safe but allow other signals to add minimal risk if needed.
    if is_trusted_domain(domain):
        score -= 30
        reasons.append(f"Domain '{domain}' is in the trusted list (reduce risk)")

    # 2) BLACKLISTED → high risk immediately
    if domain in BLACKLIST_DOMAINS:
        return {
            "risk_score": 100,
            "verdict": "phishing",
            "confidence": 0.98,
            "reasons": [f"Domain '{domain}' is blacklisted"]
        }

    # 3) Typosquatting
    if has_typosquatting(domain):
        score += 60
        reasons.append(f"Domain '{domain}' suspected of typo-squatting")

    # 4) Scheme
    if not url.lower().startswith(("http://", "https://")):
        score += 50
        reasons.append("URL does not use http:// or https://")

    # 5) WHOIS domain age
    try:
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if creation_date is None:
            raise ValueError("No creation date")

        # Normalize datetime
        if getattr(creation_date, "tzinfo", None):
            now = datetime.now(timezone.utc)
        else:
            now = datetime.now()
            creation_date = creation_date.replace(tzinfo=None)

        age_in_days = (now - creation_date).days

        if age_in_days < 30:
            score += 40
            reasons.append(f"Newly registered domain (age: {age_in_days} days)")
        elif age_in_days < 365:
            score += 10
            reasons.append("Domain registered less than a year ago")

    except Exception as e:
        # don't crash; use a small penalty for unknown age
        if any(domain.endswith(tld) for tld in GOV_TLDS):
            reasons.append("Domain is governmental/education – WHOIS may be private by policy")
        else:
            score += 20
            reasons.append("Domain age could not be verified (private/unknown)")

    # 6) ML probability (Pipeline)
    try:
        p = _ml_phishing_probability(url_pipe, url)
        ml_score = int(round(p * 100))

        # Convert ML probability into additive score
        # (keeps scoring stable + easy to tune)
        if ml_score >= 85:
            score += 55
            reasons.append(f"ML model strongly indicates phishing (p={p:.2f})")
        elif ml_score >= 60:
            score += 35
            reasons.append(f"ML model indicates suspicious patterns (p={p:.2f})")
        elif ml_score >= 40:
            score += 15
            reasons.append(f"ML model sees mild risk (p={p:.2f})")
        else:
            reasons.append(f"ML model sees low risk (p={p:.2f})")

    except Exception as e:
        # IMPORTANT: don't silently ignore ML failure
        score += 10
        reasons.append(f"ML check unavailable (model/vectorizer issue): {e}")

    # Clamp score
    score = max(0, min(score, 100))

    # Final verdict
    if score >= 70:
        verdict = "phishing"
        confidence = min(score / 100, 0.99)
    elif score >= 40:
        verdict = "suspicious"
        confidence = min(score / 100, 0.95)
    else:
        verdict = "safe"
        confidence = max(0.60, 1 - (score / 100))

    return {
        "risk_score": score,
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons if reasons else ["No phishing indicators detected"]
    }