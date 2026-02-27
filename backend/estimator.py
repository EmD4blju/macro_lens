import os
import base64
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from models import FoodEntryCreate

class MacroEstimator:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash", 
            temperature=0.7, 
            api_key=os.getenv("GOOGLE_API_KEY")
        )
        self.structured_llm = self.llm.with_structured_output(FoodEntryCreate)
        
    async def estimate(self, image_bytes: bytes) -> FoodEntryCreate:
        base64_image = base64.b64encode(image_bytes).decode("utf-8") 
        prompt = f"Analyze the following meal image and provide a structured breakdown of the food items and their estimated macros."
        
        message = HumanMessage(content=[
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
        ])
        
        return self.structured_llm.invoke([message])