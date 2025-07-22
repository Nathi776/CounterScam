import logging
from logging.handlers import RotatingFileHandler
import os

# Setup log directory
LOG_DIR = os.path.join(os.path.dirname(__file__), '..', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

# File paths
APP_LOG_FILE = os.path.join(LOG_DIR, 'app.log')
ERROR_LOG_FILE = os.path.join(LOG_DIR, 'errors.log')

# Formatter
formatter = logging.Formatter('%(asctime)s %(levelname)s: %(message)s')

# --- App Logger (General Info, Warnings) ---
app_handler = RotatingFileHandler(
    APP_LOG_FILE,
    maxBytes=5 * 1024 * 1024,  # 5 MB
    backupCount=3
)
app_handler.setLevel(logging.INFO)
app_handler.setFormatter(formatter)

# --- Error Logger (Errors, Critical) ---
error_handler = RotatingFileHandler(
    ERROR_LOG_FILE,
    maxBytes=2 * 1024 * 1024,  # 2 MB
    backupCount=2
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

# --- Console Handler (Optional) ---
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# --- Main Logger ---
logger = logging.getLogger('phishing-detector')
logger.setLevel(logging.INFO)

# Avoid duplicate logs if the module is imported multiple times
if not logger.handlers:
    logger.addHandler(app_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)
