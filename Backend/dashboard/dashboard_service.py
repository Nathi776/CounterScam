from sqlalchemy.orm import Session
from sqlalchemy import func
from database import URLCheck
from datetime import datetime, timedelta
from urllib.parse import urlparse


def extract_domain(url: str):
    try:
        domain = urlparse(url).netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except:
        return "unknown"


# TOTAL STATS
def get_overview_stats(db: Session):

    total = db.query(URLCheck).count()

    phishing = db.query(URLCheck)\
        .filter(URLCheck.flagged == "True")\
        .count()

    safe = total - phishing

    return {
        "total_scanned": total,
        "phishing_detected": phishing,
        "safe_urls": safe,
        "detection_rate": round((phishing / total) * 100, 2) if total > 0 else 0
    }


# MOST TARGETED DOMAINS
def get_top_targeted_domains(db: Session, limit=10):

    records = db.query(URLCheck.url).all()

    domain_count = {}

    for record in records:
        domain = extract_domain(record.url)
        domain_count[domain] = domain_count.get(domain, 0) + 1

    sorted_domains = sorted(
        domain_count.items(),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        {"domain": domain, "count": count}
        for domain, count in sorted_domains[:limit]
    ]


# RECENT ATTACKS
def get_recent_attacks(db: Session, limit=10):

    attacks = db.query(URLCheck)\
        .filter(URLCheck.flagged == "True")\
        .order_by(URLCheck.checked_at.desc())\
        .limit(limit)\
        .all()

    return [
        {
            "url": attack.url,
            "reason": attack.reason,
            "checked_at": attack.checked_at
        }
        for attack in attacks
    ]


# ATTACK TREND (last 7 days)
def get_attack_trend(db: Session):

    seven_days_ago = datetime.utcnow() - timedelta(days=7)

    results = db.query(
        func.date(URLCheck.checked_at),
        func.count(URLCheck.id)
    )\
    .filter(
        URLCheck.checked_at >= seven_days_ago,
        URLCheck.flagged == "True"
    )\
    .group_by(func.date(URLCheck.checked_at))\
    .all()

    return [
        {
            "date": str(date),
            "attacks": count
        }
        for date, count in results
    ]

