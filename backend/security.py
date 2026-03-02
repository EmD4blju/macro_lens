import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Depends, HTTPException

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