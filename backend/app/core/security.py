from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.text import MIMEText
from passlib.context import CryptContext
import random
import string
import smtplib
from ..core.settings import settings
from datetime import datetime, timedelta
from typing import Optional
import jwt


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP"""
    return ''.join(random.choices(string.digits, k=length))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=24))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def send_email(to_email: str, otp: str):
    try:
        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = to_email
        msg["Subject"] = "Your OTP for Login"

        body = f"""
        <html>
            <body>
                <h2>Your OTP Code</h2>
                <p>Your OTP for login is: <strong>{otp}</strong></p>
                <p>This OTP will expire in {settings.OTP_EXPIRY_MINUTES} minutes.</p>
            </body>
        </html>
        """

        msg.attach(MIMEText(body, "html"))

        # ✅ Correct SMTP usage
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.ehlo()
        server.starttls()
        server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False