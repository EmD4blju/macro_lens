from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import date


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
    creation_date: date = Field(default_factory=date.today)
    user_id: int = Field(foreign_key="user.id")
    user: Optional[User] = Relationship(back_populates="food_entries")


class FoodEntryCreate(SQLModel):
    food_name: str = Field(description="The full common name of the dish or food item (e.g. 'Grilled chicken breast with roasted vegetables')")
    description: Optional[str] = Field(default=None, description="A detailed 2-3 sentence description of the dish covering its main ingredients, preparation style, and any notable nutritional characteristics such as being high in protein, rich in fiber, or calorie-dense")
    calories: float = Field(description="Total estimated calories (kcal) for the entire portion visible in the image")
    protein: float = Field(description="Total estimated protein content in grams for the entire portion")
    fat: float = Field(description="Total estimated fat content in grams for the entire portion")
    carbohydrates: float = Field(description="Total estimated carbohydrate content in grams for the entire portion")
