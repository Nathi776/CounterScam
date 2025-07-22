from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

from database import SessionLocal, URLCheck, MessageCheck, ReportContent
from ml.model import detect_with_ml
from ml.rule_based import detect_phishing_url_rule_based, detect_scam_message_rule_based

from utils.logger import logger

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # CHANGE before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load ML model and vectorizer
BASE_DIR = os.path.dirname(__file__)
try:
    phishing_model = joblib.load(os.path.join(BASE_DIR, 'phishing_model.pkl'))
    vectorizer = joblib.load(os.path.join(BASE_DIR, 'vectorizer.pkl'))
    logger.info("ML model and vectorizer loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load ML model/vectorizer: {e}")
    raise RuntimeError("Model loading failed.")

# Pydantic schemas
class URLRequest(BaseModel):
    url: str

class MessageRequest(BaseModel):
    message: str

class ReportRequest(BaseModel):
    content: str
    type: str

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed.")
    finally:
        db.close()

# URL Detection API
@app.post("/check_url/")
async def check_url(request: URLRequest, db=Depends(get_db)):
    try:
        logger.info(f"Received URL check request: {request.url}")
        rule_flagged, rule_reason = detect_phishing_url_rule_based(request.url)
        ml_flagged = bool(detect_with_ml(request.url, vectorizer, phishing_model))

        final_flagged = rule_flagged or ml_flagged
        reason = (f"Rule-based: {rule_reason}" if rule_flagged else '') + \
                 (" | ML: Phishing" if ml_flagged else '')

        db_record = URLCheck(url=request.url, flagged=str(final_flagged), reason=reason)
        db.add(db_record)
        db.commit()

        return {"url": request.url, "flagged": final_flagged, "reason": reason.strip() or "URL is safe."}

    except Exception as e:
        logger.error(f"Error in /check_url/: {e}")
        raise HTTPException(status_code=500, detail="Error processing URL check.")

# Message Detection API
@app.post("/check_message/")
async def check_message(request: MessageRequest, db=Depends(get_db)):
    try:
        logger.info("Received message check request.")
        rule_flagged, rule_reason = detect_scam_message_rule_based(request.message)
        ml_flagged = bool(detect_with_ml(request.message, vectorizer, phishing_model))

        final_flagged = rule_flagged or ml_flagged
        reason = (f"Rule-based: {rule_reason}" if rule_flagged else '') + \
                 (" | ML: Phishing" if ml_flagged else '')

        db_record = MessageCheck(message=request.message, flagged=str(final_flagged), reason=reason)
        db.add(db_record)
        db.commit()

        return {"message": request.message, "flagged": final_flagged, "reason": reason.strip() or "Message is safe."}

    except Exception as e:
        logger.error(f"Error in /check_message/: {e}")
        raise HTTPException(status_code=500, detail="Error processing message check.")

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
