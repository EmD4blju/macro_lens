import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from database import engine
from models import User, UserRole, UserAccountStatus
from PIL import Image
import io


JWT_SIGNATURE = os.getenv("JWT_SIGNATURE")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 4
security = HTTPBearer()

def create_access_token(email:str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    
    return jwt.encode(payload, JWT_SIGNATURE, ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SIGNATURE, ALGORITHM)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
def verify_admin(email: str = Depends(verify_token)) -> str:
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user or user.role != UserRole.admin:
            raise HTTPException(status_code=403, detail="Admin access required")
        return email
    
def verify_status(email: str = Depends(verify_token)) -> str:
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user or user.account_status != UserAccountStatus.approved:
            raise HTTPException(status_code=403, detail="Account inactive")
        return email
    
    
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
    
def verify_image_mime_type(file: UploadFile = File(...)) -> UploadFile:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="File must be an image")
    return file

async def verify_image_integrity(file: UploadFile = Depends(verify_image_mime_type)):
    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="File is not a valid image") 
    await file.seek(0)
    return file