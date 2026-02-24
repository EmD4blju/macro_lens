from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel, Session, select
from database import engine
from models import User, FoodEntry, FoodEntryCreate


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)


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
    
@app.get("/user-foods")
def get_user_foods(email: str):
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            return {"error": "User not found"}
        return user.food_entries
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)