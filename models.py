from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    food_entries: List["FoodEntry"] = Relationship(back_populates="user")


class FoodEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    food_name: str
    description: Optional[str] = None
    calories: float
    protein: float
    fat: float
    carbohydrates: float
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="food_entries")


class FoodEntryCreate(SQLModel):
    food_name: str
    description: Optional[str] = None
    calories: float
    protein: float
    fat: float
    carbohydrates: float
