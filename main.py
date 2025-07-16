from fastapi import FastAPI
from pydantic import BaseModel
from urllib.parse import urlparse
import whois
import re

from database import SessionLocal, URLCheck, MessageCheck, ReportContent


app = FastAPI()


BLACKLIST_DOMAINS = ['phishingsite.com', 'secure-login.bank.com']

PHISHING_KEYWORDS = [
    'urgent', 'verify', 'account locked', 'click here',
    'update your account', 'password expired', 'security alert'
]


class URLRequest(BaseModel):
    url: str

class MessageRequest(BaseModel):
    message: str

class ResportRequest(BaseModel):
    content: str
    type: str


def is_blacklisted(url):
    domain = urlparse(url).netloc
    return domain in BLACKLIST_DOMAINS

def has_typosquatting(domain, real_domain= 'bank.com'):
    return real_domain not in domain

def get_domain_age(domain):
    try:
        domain_info = whois.whois(domain)
        return domain_info.creation_date
    except:
        return None

def detect_phishing_url(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    if is_blacklisted(url):
        return True, 'Domain is blacklisted.'
    
    if has_typosquatting(domain):
        return True, 'Domain is suspected of typo-squatting.'
    
    if not url.startswith(('http://', 'https://')):
        return True, 'URL does not start with http:// or https://'

    domain_age = get_domain_age(domain)
    if domain_age is None:
        return True, 'Domain age could not be determined.'


    return False, 'URL is safe'

def extract_url(message):
    url_regex = r'(https?://[^\s]+)'
    return re.findall(url_regex, message)

def detect_scam_message(message):
    
    for keyword in PHISHING_KEYWORDS:
        if keyword in message.lower():
            return True, f'Message contains phishing keyword: {keyword}'
        
    urls_found = extract_url(message)
    for url in urls_found:
        flagged, reason = detect_phishing_url(url)
        if flagged:
            return True, f"Suspicious link found: {reason}"
        
    return False, 'Message is safe'

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.post("/check_url/")
async def check_url(request: URLRequest):
    flagged, reason = detect_phishing_url(request.url)
    db = next(get_db())
    db_record = URLCheck(
        url=request.url,
        flagged=str(flagged),
        reason=reason
    )
    db.add(db_record)
    db.commit()
    return {"url": request.url, "flagged": flagged, "reason": reason}


@app.post("/check_message/")
async def check_message(request: MessageRequest):
    flagged, reason = detect_scam_message(request.message)
    db = next(get_db())
    db_record = MessageCheck(
        message=request.message,
        flagged=str(flagged),
        reason=reason
    )
    db.add(db_record)
    db.commit()
    return {"message": request.message, "flagged": flagged, "reason": reason}


@app.post("/report/")
async def report(request: ResportRequest):
    db = next(get_db())
    db_record = ReportContent(
        content_type=request.type,
        content=request.content
    )
    db.add(db_record)
    db.commit()

    return {
        "status": "Report received",
        "type": request.type,
        "content": request.content
    }


