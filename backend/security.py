import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from database import engine
from models import User, UserRole, UserAccountStatus


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