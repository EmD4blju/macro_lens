from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import SQLModel, Session, select
from database import engine
from models import User, FoodEntry, GoogleTokenRequest
from estimator import MacroEstimator
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/api/health-check")
def health_check():
    return {"status": "ok", "message": "API is running!"}

@app.post("/auth/google")
def google_auth(body: GoogleTokenRequest):
    try:
        id_info = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            os.getenv("GOOGLE_CLIENT_ID")
        )
        
        email = id_info.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token")
    
        with Session(engine) as session:
            user = session.exec(select(User).where(User.email == email)).first()
            if not user:
                user = User(email = email)
                session.add(user)
                session.commit()
                session.refresh(user)
        
        return {"access_token": create_access_token(email)}
    
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

@app.post("/add-food-image")
async def add_food_image(
    email: str = Depends(verify_token),
    file: UploadFile = File(...),
):
    #~ Read incoming image bytes
    image_bytes = await file.read()
        
    #~ Estimate macros using the MacroEstimator
    estimator = MacroEstimator()
    food_entry_data = await estimator.estimate(image_bytes)
    
    #~ Save the estimated food entry to the database
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email)
            session.add(user)
            session.flush() 
        
        food_entry = FoodEntry(**food_entry_data.model_dump(), user_id=user.id)
        session.add(food_entry)
        session.commit()
        session.refresh(food_entry)
        
    return {"status": "processed"}

@app.delete("/delete-food/{food_id}")
def delete_food(food_id: int, email: str = Depends(verify_token)):
    with Session(engine) as session:
        food_entry = session.get(FoodEntry, food_id)
        if not food_entry:
            return {"error": "Food entry not found"}
        session.delete(food_entry)
        session.commit()
        return {"status": "ok", "message": f"Deleted entry {food_id}"}
    
@app.get("/user-foods")
def get_user_foods(entry_date: date, email: str = Depends(verify_token)):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            return {"error": "User not found"}
        
        query = select(FoodEntry).where(
            FoodEntry.user_id == user.id,
            FoodEntry.creation_date == entry_date
        )
        
        return session.exec(query).all()
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)