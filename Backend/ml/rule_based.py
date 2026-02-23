from urllib.parse import urlparse
import whois
import re

BLACKLIST_DOMAINS = ['phishingsite.com', 'secure-login.bank.com']
PHISHING_KEYWORDS = [
    'urgent', 'verify', 'account locked', 'click here',
    'update your account', 'password expired', 'security alert'
]

def is_blacklisted(url):
    domain = urlparse(url).netloc
    return domain in BLACKLIST_DOMAINS


from urllib.parse import urlparse

KNOWN_BRANDS = [
    "paypal",
    "google",
    "microsoft",
    "apple",
    "amazon",
    "absa",
    "fnb",
    "standardbank",
    "capitec"
]

TRUSTED_DOMAINS = [
    "paypal.com",
    "google.com",
    "microsoft.com",
    "apple.com",
    "amazon.com",
    "absa.co.za",
    "fnb.co.za",
    "standardbank.co.za",
    "capitecbank.co.za"
]


def normalize_domain(domain: str):
    domain = domain.lower().strip()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def is_exact_trusted(domain: str):
    domain = normalize_domain(domain)

    if domain in TRUSTED_DOMAINS:
        return True

    for trusted in TRUSTED_DOMAINS:
        if domain.endswith("." + trusted):
            return True

    return False


def has_typosquatting(domain: str):

    domain = normalize_domain(domain)

    if is_exact_trusted(domain):
        return False

    for brand in KNOWN_BRANDS:

        if brand in domain:

            if domain != f"{brand}.com" and not domain.endswith(f".{brand}.com"):
                return True

    return False


def get_domain_age(domain):
    try:
        domain_info = whois.whois(domain)
        return domain_info.creation_date
    except:
        return None

def detect_phishing_url_rule_based(url):
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

def detect_scam_message_rule_based(message):
    for keyword in PHISHING_KEYWORDS:
        if keyword in message.lower():
            return True, f'Message contains phishing keyword: {keyword}'

    urls_found = extract_url(message)
    for url in urls_found:
        flagged, reason = detect_phishing_url_rule_based(url)
        if flagged:
            return True, f"Suspicious link found: {reason}"

    return False, 'Message is safe'
