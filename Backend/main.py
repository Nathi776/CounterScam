from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os
import socket

from database import SessionLocal, URLCheck, MessageCheck, ReportContent, init_db
from detection.risk_engine import calculate_risk_score
from detection.message_risk_engine import calculate_message_risk_score
from detection.fraud_monitor import FraudMonitor
from detection.domain_utils import extract_domain

from auth import create_access_token, verify_token, ADMIN_USERNAME, ADMIN_PASSWORD

from collections import Counter

from sqlalchemy import func
from datetime import datetime, timedelta

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError

#from dashboard.dashboard_routes import router as dashboard_router

from utils.logger import logger

app = FastAPI()


@app.on_event("startup")
def _startup() -> None:
    # Ensure tables exist for local/dev runs.
    try:
        init_db()
        logger.info("Database initialized (tables ensured).")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        # Let the app start; DB errors will surface on first request.

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket.setdefaulttimeout(5.0)

# Load ML pipeline (vectorizer + model together)
BASE_DIR = os.path.dirname(__file__)
try:
    url_pipe = joblib.load(os.path.join(BASE_DIR, "url_pipeline.pkl"))
    msg_pipe = joblib.load(os.path.join(BASE_DIR, "message_pipeline.pkl"))
    logger.info("URL + Message ML pipeline loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load ML pipeline: {e}")
    raise RuntimeError("Model loading failed.")

fraud_monitor = FraudMonitor(msg_pipe)

# Pydantic schemas
class URLRequest(BaseModel):
    url: str

class MessageRequest(BaseModel):
    message: str

class ReportRequest(BaseModel):
    content: str
    type: str


class AdminLoginRequest(BaseModel):
    username: str
    password: str

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    except HTTPException:
        # don't convert auth errors into DB errors
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed.")
    finally:
        db.close()

# URL Detection API
@app.post("/check_url/")
async def check_url(request: URLRequest, db=Depends(get_db)):

    result = calculate_risk_score(
        request.url,
        url_pipe
    )

    flagged = result["verdict"] in ["phishing", "suspicious"]

    reason = ", ".join(result["reasons"])

    db_record = URLCheck(
        url=request.url,
        flagged=str(flagged),
        reason=reason
    )

    db.add(db_record)
    db.commit()

    return {
        "url": request.url,
        "flagged": flagged,
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "risk_score": result["risk_score"],
        "reasons": result["reasons"]
    }

# Message Detection API

@app.post("/check_message/")
async def check_message(request: MessageRequest, db=Depends(get_db)):

    result = calculate_message_risk_score(
        request.message,
        msg_pipe, url_pipe
    )

    flagged = result["verdict"] in ["phishing", "suspicious"]

    reason = ", ".join(result["reasons"])

    db_record = MessageCheck(
        message=request.message,
        flagged=str(flagged),
        reason=reason
    )

    db.add(db_record)
    db.commit()

    return {

        "message": request.message,
        "flagged": flagged,
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "risk_score": result["risk_score"],
        "reasons": result["reasons"]

    }



# Report Content
@app.post("/report/")
async def report(request: ReportRequest, db=Depends(get_db)):
    try:
        logger.info("Received report submission.")
        db_record = ReportContent(content_type=request.type, content=request.content)
        db.add(db_record)
        db.commit()
        return {"status": "Report received", "type": request.type, "content": request.content}
    except Exception as e:
        logger.error(f"Error in /report/: {e}")
        raise HTTPException(status_code=500, detail="Error processing report.")

@app.post("/monitor/")
async def monitor_message(request: MessageRequest):
    result = fraud_monitor.process_message(request.message)

    return result


# Admin Dashboard

@app.post("/admin/login")
def admin_login(payload: AdminLoginRequest):
    """Simple admin login for the React admin-dashboard.

    NOTE: For production, replace this with proper user storage + hashing.
    """
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": payload.username})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/admin/stats")
def get_stats(db=Depends(get_db), _=Depends(verify_token)):
    try:
        total_urls = db.query(URLCheck).count()
        total_messages = db.query(MessageCheck).count()
        total_reports = db.query(ReportContent).count()

        flagged_urls = db.query(URLCheck).filter(URLCheck.flagged == "True").count()
        flagged_messages = db.query(MessageCheck).filter(MessageCheck.flagged == "True").count()

        total_checks = total_urls + total_messages
        phishing_detected = flagged_urls + flagged_messages
        safe = max(total_checks - phishing_detected, 0)

        return {
            # Raw counts
            "total_urls": total_urls,
            "total_messages": total_messages,
            "total_reports": total_reports,
            "flagged_urls": flagged_urls,
            "flagged_messages": flagged_messages,
            # Frontend-friendly aliases
            "total_checks": total_checks,
            "phishing_detected": phishing_detected,
            "safe": safe,
        }
    except Exception as e:
        logger.error(f"Error in /admin/stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stats.")


@app.get("/admin/recent-checks")
def get_recent_checks(db=Depends(get_db), _=Depends(verify_token)):
    try:
        recent_urls = db.query(URLCheck).order_by(URLCheck.id.desc()).limit(5).all()
        recent_messages = db.query(MessageCheck).order_by(MessageCheck.id.desc()).limit(5).all()

        recent_urls_payload = [
            {"url": r.url, "flagged": r.flagged, "reason": r.reason, "checked_at": r.checked_at}
            for r in recent_urls
        ]
        recent_messages_payload = [
            {"message": r.message, "flagged": r.flagged, "reason": r.reason, "checked_at": r.checked_at}
            for r in recent_messages
        ]

        # A single list that frontends can render easily.
        combined = []
        for r in recent_urls_payload:
            combined.append({
                "type": "url",
                "content": r["url"],
                "flagged": r["flagged"],
                "reason": r["reason"],
                "checked_at": str(r["checked_at"]) if r.get("checked_at") else None,
            })
        for r in recent_messages_payload:
            combined.append({
                "type": "message",
                "content": r["message"],
                "flagged": r["flagged"],
                "reason": r["reason"],
                "checked_at": str(r["checked_at"]) if r.get("checked_at") else None,
            })

        return {
            "recent_urls": recent_urls_payload,
            "recent_messages": recent_messages_payload,
            "recent_checks": combined,
        }
    except Exception as e:
        logger.error(f"Error in /admin/recent-checks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent checks.")


@app.get("/admin/analytics")
def get_analytics(db=Depends(get_db), _=Depends(verify_token)):
    try:
        last_7_days = datetime.utcnow() - timedelta(days=7)

        daily_counts = (
            db.query(
                func.date(URLCheck.checked_at),
                func.count(URLCheck.id)
            )
            .filter(URLCheck.checked_at >= last_7_days)
            .group_by(func.date(URLCheck.checked_at))
            .all()
        )

        # Top targeted domains (based on checked URLs, last 30 days)
        last_30_days = datetime.utcnow() - timedelta(days=30)
        urls_last_30 = (
            db.query(URLCheck.url)
            .filter(URLCheck.checked_at >= last_30_days)
            .all()
        )

        domains = [extract_domain(u[0]) for u in urls_last_30 if u and u[0]]
        domain_counts = Counter([d for d in domains if d])
        top_domains = [
            {"domain": domain, "count": count}
            for domain, count in domain_counts.most_common(10)
        ]

        trend = [
            {"date": str(date), "count": count}
            for date, count in daily_counts
        ]

        return {
            # Keep both keys so either frontend version works
            "last_7_days_activity": trend,
            "attack_trend": trend,
            "top_domains": top_domains,
        }
    except Exception as e:
        logger.error(f"Error in /admin/analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytics." )
