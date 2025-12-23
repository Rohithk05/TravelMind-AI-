import os
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class AIService:
    def __init__(self):
        if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_api_key_here":
            print("Warning: valid GROQ_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = AsyncGroq(api_key=GROQ_API_KEY)
            self.model = "llama-3.3-70b-versatile"

    async def generate_content(self, prompt: str) -> str:
        if not self.client:
            return "AI Service Unavailable: Please configure GROQ_API_KEY in backend/.env"
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            return f"AI Error: {str(e)}"

    async def get_json_content(self, prompt: str) -> str:
        """Forces the AI to return a JSON string using Groq's JSON mode."""
        if not self.client:
            return "{}"
        
        try:
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                model=self.model,
                response_format={"type": "json_object"}
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            print(f"Groq JSON Error: {e}")
            # Fallback to standard completion if JSON mode fails
            return await self.generate_content(prompt + "\n\nReturn only valid JSON.")

ai_service = AIService()
