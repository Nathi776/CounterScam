from urllib.parse import urlparse
import whois
import joblib
from datetime import datetime, timezone
from typing import Dict


from ml.model import detect_with_ml
from ml.rule_based import has_typosquatting, BLACKLIST_DOMAINS
from detection.domain_utils import extract_domain, is_trusted_domain

def calculate_risk_score(url: str, vectorizer, model):
    score = 0
    reasons = []

    domain = extract_domain(url)

    # ✅ 1. TRUSTED DOMAIN → Immediate Safe Verdict
    if is_trusted_domain(domain):
        return {
            "risk_score": 0,
            "verdict": "safe",
            "confidence": 0.99,
            "reasons": [f"Domain '{domain}' is on trusted list"]
        }

    # ✅ 2. BLACKLISTED? → High Risk
    if domain in BLACKLIST_DOMAINS:
        return {
            "risk_score": 100,
            "verdict": "phishing",
            "confidence": 0.98,
            "reasons": [f"Domain '{domain}' is blacklisted"]
        }

    # ✅ 3. Check for Typosquatting
    if has_typosquatting(domain):
        score += 60
        reasons.append(f"Domain '{domain}' suspected of typo-squatting")

    # ✅ 4. URL Scheme & Structure
    if not url.lower().startswith(('http://', 'https://')):
        score += 50
        reasons.append("URL does not use http:// or https://")

    # ✅ 5. Domain Age (WHOIS)
    try:
        domain_info = whois.whois(domain)
        creation_date = domain_info.creation_date

        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if creation_date is None:
            raise ValueError("No creation date")

        # Normalize datetime
        if creation_date.tzinfo:
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
        print(f"WHOIS lookup failed for {domain}: {e}")

        # Only penalize if NOT a known trustworthy TLD
        GOV_TLDS = ['.gov', '.gov.za', '.ac.za', '.mil', '.edu']
        if any(domain.endswith(tld) for tld in GOV_TLDS):
            # Government/education domains often hide WHOIS → don't punish
            reasons.append("Domain is governmental (.gov.za) – WHOIS private by policy")
        else:
            score += 20
            reasons.append("Domain age could not be verified (private/unknown)")

    # ✅ 6. ML Prediction
    try:
        ml_pred = detect_with_ml(url, vectorizer, model)
        is_phishing = (ml_pred == 1) or (str(ml_pred).lower() in ["phishing", "scam", "malicious"])

        if is_phishing:
            score += 40
            reasons.append("ML model detected phishing patterns")
    except Exception as e:
        print(f"ML error: {e}")

    # ✅ Final Verdict
    if score >= 70:
        verdict = "phishing"
        confidence = min(score / 100, 0.99)
    elif score >= 40:
        verdict = "suspicious"
        confidence = score / 100
    else:
        verdict = "safe"
        confidence = 1 - (score / 100)

    return {
        "risk_score": score,
        "verdict": verdict,
        "confidence": confidence,
        "reasons": reasons
    }