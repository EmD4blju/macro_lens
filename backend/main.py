from contextlib import asynccontextmanager
from datetime import date
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from database import engine
from models import User, FoodEntry, FoodEntryCreate
from estimator import MacroEstimator

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

@app.get("/api/health-check")
def health_check():
    return {"status": "ok", "message": "API is running!"}

@app.post("/add-food-image")
async def add_food_image(
    email: str,
    file: UploadFile = File(...)
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
def delete_food(food_id: int):
    with Session(engine) as session:
        food_entry = session.get(FoodEntry, food_id)
        if not food_entry:
            return {"error": "Food entry not found"}
        session.delete(food_entry)
        session.commit()
        return {"status": "ok", "message": f"Deleted entry {food_id}"}

@app.post("/add-food")
def add_food(email:str, food_data: FoodEntryCreate):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            user = User(email=email)
            session.add(user)
            session.flush() 
        
        food_entry = FoodEntry(**food_data.model_dump(), user_id=user.id)
        session.add(food_entry)
        session.commit()
        session.refresh(food_entry)
        return food_entry

@app.get("/list-foods")
def get_foods():
    with Session(engine) as session:
        return session.exec(select(FoodEntry)).all()
    
@app.get("/list-users")
def list_users():
    with Session(engine) as session:
        return session.exec(select(User)).all()
    
@app.get("/user-foods/{email}")
def get_user_foods(email: str, entry_date: date):
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