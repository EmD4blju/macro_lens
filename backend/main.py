from datetime import date
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from database import engine
from models import User, UserRole, UserAccountStatus, FoodEntry, GoogleTokenRequest
from estimator import MacroEstimator
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from security import create_access_token, verify_admin, verify_status, verify_token
import os


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
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
                if email == os.getenv('ADMIN_EMAIL'):
                    user.role = UserRole.admin
                    user.account_status = UserAccountStatus.approved
                session.add(user)
                session.commit()
                session.refresh(user)
        
        return {"access_token": create_access_token(email)}
    
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
@app.get("/user/status")
def get_user_status(email: str = Depends(verify_token)):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        return {"account_status": user.account_status, "role": user.role}

@app.post("/user/food/add")
async def add_food_image(
    email: str = Depends(verify_status),
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
        food_entry = FoodEntry(**food_entry_data.model_dump(), user_id=user.id)
        session.add(food_entry)
        session.commit()
        session.refresh(food_entry)
        
    return {"status": "ok"}

@app.delete("/user/food/{food_id}/delete")
def delete_food(food_id: int, email: str = Depends(verify_status)):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        food_entry = session.get(FoodEntry, food_id)
        if not food_entry:
            raise HTTPException(status_code=404, detail="Food entry not found")
        if food_entry.user_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
        session.delete(food_entry)
        session.commit()
        return {"status": "ok", "message": f"Deleted entry {food_id}"}
    
@app.get("/user/foods")
def get_user_foods(entry_date: date, email: str = Depends(verify_status)):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        query = select(FoodEntry).where(
            FoodEntry.user_id == user.id,
            FoodEntry.creation_date == entry_date
        )
        return session.exec(query).all()
    
@app.get("/admin/users")
def get_users(email: str = Depends(verify_admin)):
    with Session(engine) as session:
        users = session.exec(select(User)).all()
        return users
    
@app.patch("/admin/users/{user_id}/status")
def update_user_status(user_id: int, status: UserAccountStatus = Query(...), email: str = Depends(verify_admin)):
    with Session(engine) as session:
        user = session.get(User, user_id)  
        if not user:
            raise HTTPException(status_code=404, detail="User not found") 
        if user.email == email:
            raise HTTPException(status_code=403, detail="Cannot change your own status")     
        user.account_status = status
        session.commit()
        session.refresh(user)
        return user
    
@app.delete("/admin/users/{user_id}/delete")
def delete_user_account(user_id: int, email: str = Depends(verify_admin)):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if user.email == email:
            raise HTTPException(status_code=403, detail="Cannot delete your own account")
        session.delete(user)
        session.commit()
        return {"status": "ok", "message": f"Deleted user {user_id}"}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)