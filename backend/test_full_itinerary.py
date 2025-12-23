import os
import asyncio
import json
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

async def test_itinerary():
    key = os.getenv("GROQ_API_KEY")
    client = AsyncGroq(api_key=key)
    
    destination = "Hyderabad"
    duration = 3
    
    system_instruction = """
    You are the 'TravelMind Intelligence Engine', an advanced AI travel planner. 
    Respond ONLY with valid JSON.
    """
    
    user_context = f"Plan a {duration} day trip to {destination}."
    
    json_schema = """
    {
      "trip_summary": { "title": "String", "description": "String", "sustainability_score": 5, "estimated_total_cost": "String" },
      "days": [ { "day": 1, "date": "String", "theme": "String", "weather_prediction": "String", "activities": [ { "time": "String", "title": "String", "type": "activity", "description": "String", "location": "String", "cost_estimate": "String", "crowd_prediction": "Moderate", "ai_reasoning": "String" } ] } ]
    }
    """
    
    prompt = f"{system_instruction}\n\n{user_context}\n\n{json_schema}"
    
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        content = completion.choices[0].message.content
        print("RAW CONTENT RECEIVED")
        data = json.loads(content)
        print("SUCCESSFULLY PARSED JSON")
        print(f"TITLE: {data.get('trip_summary', {}).get('title')}")
        print(f"DAYS: {len(data.get('days', []))}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(test_itinerary())
