from urllib.parse import urlparse
from utils.logger import logger

TRUSTED_DOMAINS = [
    "paypal.com",
    "google.com",
    "microsoft.com",
    "amazon.com",
    "apple.com",
    "fnb.co.za",
    "standardbank.co.za",
    "absa.co.za",
    "capitecbank.co.za",
    "gov.za",
    "gcis.gov.za",
    "www.gov.za"
]


from urllib.parse import urlparse

def extract_domain(url: str) -> str:
    try:
        if "://" not in url:
            url = "http://" + url

        parsed = urlparse(url)
        domain = parsed.netloc.lower()

        if domain.startswith("www."):
            domain = domain[4:]

        return domain
    except Exception as e:
        logger.warning(f"Error parsing URL: {str(e)}")
        return ""



def is_trusted_domain(domain: str) -> bool:

    
    if domain in TRUSTED_DOMAINS:
        return True

    
    for trusted in TRUSTED_DOMAINS:
        if domain.endswith("." + trusted):
            return True

    return False
