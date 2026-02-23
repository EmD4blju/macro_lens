import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel, Session, create_engine, Field, select, Relationship
from dotenv import load_dotenv
from typing import List, Optional

load_dotenv()

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    food_entries: List["FoodEntry"] = Relationship(back_populates="user")

class FoodEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    food_name: str
    description: Optional[str] = None
    calories: int
    protein: float
    fat: float
    carbohydrates: float
    user_id: int = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="food_entries")
    
class FoodEntryCreate(SQLModel):
    food_name: str
    description: Optional[str] = None
    calories: int
    protein: float
    fat: float
    carbohydrates: float

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