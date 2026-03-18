import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime


# ==========================================================
# 🔧 LOGGING CONFIGURATION
# ==========================================================

# Create log directory if it doesn't exist
LOG_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../logs")
os.makedirs(LOG_DIR, exist_ok=True)


# Generate a log file for each day
LOG_FILE = os.path.join(LOG_DIR, f"{datetime.now().strftime('%Y-%m-%d')}.log")



# ----------------------------------------------------------
# Logger configuration
# ----------------------------------------------------------
logger = logging.getLogger("smart_agri_logger")
logger.setLevel(logging.DEBUG)  # Capture all levels (DEBUG → CRITICAL)

# ----------------------------------------------------------
# File Handler – saves logs to file
# ----------------------------------------------------------
file_handler = RotatingFileHandler(
    LOG_FILE, maxBytes=5*1024*1024, backupCount=5, encoding='utf-8'
)
file_format = logging.Formatter(
    "%(asctime)s | [%(levelname)s] | %(name)s | %(funcName)s | Line %(lineno)d | %(message)s"
)
file_handler.setFormatter(file_format)
file_handler.setLevel(logging.DEBUG)


# ----------------------------------------------------------
# Console Handler – prints logs in terminal
# ----------------------------------------------------------
console_handler = logging.StreamHandler()
console_format = logging.Formatter(
    "%(asctime)s | [%(levelname)s] | %(message)s", "%H:%M:%S"
)
console_handler.setFormatter(console_format)
console_handler.setLevel(logging.INFO)


# ----------------------------------------------------------
# Attach handlers
# ----------------------------------------------------------
if not logger.hasHandlers():
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)


# ----------------------------------------------------------
# Example usage (remove after setup)
# ----------------------------------------------------------
if __name__ == "__main__":
    logger.debug("Debugging mode is active.")
    logger.info("Logger initialized successfully.")
    logger.warning("This is a warning example.")
    logger.error("This is an error example.")
