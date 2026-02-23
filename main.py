import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlmodel import SQLModel, Session, create_engine, Field, select
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DATABASE_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

class FoodEntry(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    food_name: str
    calories: int

@app.post("/add-mock")
def add_mock():
    with Session(engine) as session:
        new_food = FoodEntry(food_name="Pizza z nowym Lifespan", calories=1200)
        session.add(new_food)
        session.commit()
        session.refresh(new_food)
        return new_food

@app.get("/list")
def list_food():
    with Session(engine) as session:
        return session.exec(select(FoodEntry)).all()
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)