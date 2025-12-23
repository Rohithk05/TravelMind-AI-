import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

async def test():
    key = os.getenv("GROQ_API_KEY")
    print(f"KEY: {key[:10]}...")
    client = AsyncGroq(api_key=key)
    try:
        completion = await client.chat.completions.create(
            messages=[{"role": "user", "content": "Hello"}],
            model="llama-3.3-70b-versatile",
        )
        print(f"SUCCESS: {completion.choices[0].message.content}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test())
