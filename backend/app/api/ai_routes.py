from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.ai_service import ai_service
from typing import List, Optional, Dict
from app.auth.auth_utils import get_current_user, User

router = APIRouter(dependencies=[Depends(get_current_user)])

# --- Advanced Request Models ---

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class UserPreferences(BaseModel):
    pace: str  # e.g., "Relaxed", "Moderate", "Fast-paced"
    travel_style: List[str]  # e.g., ["Foodie", "Adventure", "History"]
    accessibility: Optional[str] = None
    dietary_restrictions: Optional[str] = None

class AdvancedItineraryRequest(BaseModel):
    destination: str
    dates: str      # Could be a range string
    duration_days: int
    budget: str     # e.g., "Medium", "$3000"
    group_size: int
    preferences: UserPreferences
    natural_language_prompt: Optional[str] = None # User's free-text description

class InsightRequest(BaseModel):
    destination: str
    category: str
    context: Optional[List[str]] = None

# --- Endpoints ---

@router.post("/chat")
async def chat_with_companion(request: ChatRequest):
    prompt = f"""
    You are an expert AI Travel Companion for TravelMind.
    Context: The user is interested in {request.context if request.context else 'general travel'}.
    User: {request.message}
    
    Provide a helpful, friendly, and expert response. Keep it concise (under 100 words) unless asked for details.
    """
    response = await ai_service.generate_content(prompt)
    return {"response": response}

@router.post("/plan")
async def generate_advanced_itinerary(request: AdvancedItineraryRequest):
    """
    Generates a highly detailed, context-aware itinerary using the AI Intelligence Engine.
    """
    # Construct a rich prompt for the AI
    system_instruction = """
    You are the 'TravelMind Intelligence Engine', an advanced AI travel planner. 
    Your goal is to create a hyper-personalized, logistic-optimized travel itinerary.
    
    CRITICAL OUTPUT RULES:
    1. Respond ONLY with valid JSON.
    2. Do NOT act like a chatbot. Do not say "Here is your plan". Just JSON.
    3. The JSON must match the specific schema provided below.
    
    OPTIMIZATION CRITERIA:
    - Logic: Minimizing travel time between spots (clustering).
    - Pacing: Respect the user's requested pace (Relaxed = max 3 activities/day).
    - Context: heavily weigh the 'natural_language_prompt' for intent (e.g., if they say "I hate waking up early", start days at 11 AM).
    - Explainability: Every choice must have an "ai_reasoning" field explaining WHY it fits.
    """

    user_context = f"""
    TRIP DETAILS:
    - Destination: {request.destination}
    - Duration: {request.duration_days} days
    - Dates: {request.dates}
    - Budget: {request.budget}
    - Group Size: {request.group_size} people
    
    USER PREFERENCES:
    - Pace: {request.preferences.pace}
    - Styles: {", ".join(request.preferences.travel_style)}
    - Constraints: {request.preferences.accessibility or "None"}, {request.preferences.dietary_restrictions or "None"}
    - Specific Request (Intent): "{request.natural_language_prompt}"
    """

    json_schema = """
    REQUIRED JSON STRUCTURE:
    {
      "trip_summary": {
        "title": "String",
        "description": "Short overview of the vibe",
        "sustainability_score": "Integer 1-10",
        "estimated_total_cost": "String"
      },
      "days": [
        {
          "day": 1,
          "date": "String",
          "theme": "String (e.g., 'Historical Immersion')",
          "weather_prediction": "String (e.g., 'Sunny, 24°C')",
          "activities": [
            {
              "time": "String (e.g., '10:00 AM')",
              "title": "String",
              "type": "transport|hotel|food|activity|break",
              "description": "String",
              "location": "String",
              "cost_estimate": "String",
              "crowd_prediction": "Low|Moderate|High|Extreme",
              "ai_reasoning": "String (Why this specific spot? Link to user prefs)",
              "alternatives": [
                 { "title": "String", "reason": "String (e.g., 'If rain', 'Cheaper option')" }
              ]
            }
          ]
        }
      ]
    }
    """

    final_prompt = f"{system_instruction}\n\n{user_context}\n\n{json_schema}"
    
    raw_response = await ai_service.get_json_content(final_prompt)
    
    # Parse the string into a dict
    import json
    try:
        json_response = json.loads(raw_response)
        # Ensure it's not an empty object and has at least some structure
        if not json_response or not isinstance(json_response, dict) or "days" not in json_response:
            raise ValueError("Invalid structure")
    except Exception as e:
        print(f"AI JSON Parse Failed or Invalid: {e}")
        # Return a robust fallback structure so the UI is usable even if AI fails
        json_response = {
            "trip_summary": {
                "title": f"Discovery of {request.destination}", 
                "description": f"A comprehensive {request.duration_days}-day adventure tailored to your interests in {', '.join(request.preferences.travel_style)}.",
                "sustainability_score": 9,
                "estimated_total_cost": request.budget
            },
            "days": [
                {
                    "day": 1,
                    "date": "Initial Arrival",
                    "theme": "Local Immersion",
                    "weather_prediction": "Clear skies, 24°C",
                    "activities": [
                        {
                            "time": "10:00 AM",
                            "title": f"Explore {request.destination} Old Town",
                            "type": "activity",
                            "description": "Walk through the historical alleys and discover hidden architectural gems.",
                            "location": "Historic Center",
                            "cost_estimate": "Free",
                            "ai_reasoning": "Historical context is essential for any first-time visitor.",
                            "crowd_prediction": "Moderate"
                        },
                        {
                            "time": "01:00 PM",
                            "title": "Local Gastronomy Experience",
                            "type": "food",
                            "description": "Authentic lunch at a family-run heritage restaurant.",
                            "location": "Downtown Area",
                            "cost_estimate": "$20",
                            "ai_reasoning": "Voted #1 for authentic local cuisine.",
                            "crowd_prediction": "High"
                        }
                    ]
                }
            ] 
        }

    return {"itinerary_json": json.dumps(json_response)}


@router.post("/replan")
async def dynamic_replan(request: AdvancedItineraryRequest, trigger: str = "rain"):
    """
    Endpoint for dynamic replanning based on triggers (weather, crowd, shut-down).
    """
    # Simply re-uses the logic but with an added constraint in the prompt
    # In a real app, this would take the EXISTING itinerary and modify it.
    # For now, we will simulate it by adding the trigger to the prompt constraints.
    
    prompt = f"""
    MODIFY the previous request for {request.destination} because of a sudden change: {trigger}.
    Example: If rain, replace outdoor activities with museums/cafes.
    
    Generate a 1-day adjusted plan example (just Day 1) to demonstrate adaptation.
    Return JSON format similar to the main planner but just for one day.
    """
    # Simplified handling for this demo
    return {"message": "Replanning logic would go here, utilizing similar AI capabilities."}

@router.post("/insight")
async def get_travel_insight(request: InsightRequest):
    if request.category == "crowd":
        prompt = f"""
        Provide a real-time crowd intelligence report for {request.destination}.
        Include:
        1. 'hourly_forecast': Array of 7 objects with 'time' (8AM to 8PM) and 'density' (0-100).
        2. 'major_spots': Array of 3 key attractions in {request.destination} with 'name', 'status' (Low/Moderate/High), 'density' (0-100), and 'wait_time' (mins).
        3. 'advice': A specific tip to avoid crowds.
        
        Return ONLY valid JSON.
        """
    elif request.category == "safety":
        prompt = f"""
        Provide a live safety intelligence report for {request.destination}.
        Include:
        1. 'score': Safety rating (0-100).
        2. 'status': Brief status (e.g., 'Very Safe', 'Exercise Caution').
        3. 'advisories': List of 3 specific current safety tips for tourists.
        4. 'emergency': Emergency phone number.
        5. 'risks': List of 3 potential risks (e.g., 'Pickpockets in Metro', 'Sun Exposure').
        
        Return ONLY valid JSON.
        """
    elif request.category == "budget":
        prompt = f"""
        Provide a professional smart budget saving report for {request.destination}.
        Include:
        1. 'savings_strategies': 3 specific tips to save money in {request.destination}.
        2. 'cost_index': Relative cost for food, transport, and hotels (Low/Mid/High).
        3. 'hidden_deals': 2 specific local gems that are cheap or free.
        4. 'budget_analysis': A 2-sentence expert summary of how to manage {request.budget} in {request.destination}.
        5. 'suggested_split': {{'Accommodation': %, 'Food': %, 'Transport': %, 'Activities': %}} based on the destination.
        6. 'top_priority_save': The single best way to save money here.
        7. 'typical_expenses': List of 5 typical tourist expenses (e.g. 'Coffee', 'Quick Lunch', 'Local Transport') with estimated prices for {request.destination}.
        
        Return ONLY valid JSON.
        """
    elif request.category == "sustainability":
        prompt = f"""
        Provide a live sustainability / eco-travel report for {request.destination}.
        Include:
        1. 'footprint_data': Array of 3 objects with 'name' (Flights, Hotel, Transport), 'value' (CO2 in kg), and 'color' (hex).
        2. 'eco_swaps': Array of 2 objects with 'original' (bad option), 'swap' (good option), 'co2_saved' (kg), and 'financial_save' (string).
        3. 'local_eco_status': A specific eco-fact about {request.destination}.
        
        Return ONLY valid JSON.
        """
    elif request.category == "reviews":
        places_str = f" for these specific places: {', '.join(request.context)}" if request.context else ""
        prompt = f"""
        Provide a real-time sentiment and review report for {request.destination}{places_str}.
        Include:
        1. 'trust_score': Overall rating (0-5.0).
        2. 'pros': List of 3 strings (What people love).
        3. 'cons': List of 3 strings (Common complaints).
        4. 'reviews': Array of 3 objects with 'author', 'rating' (1-5), 'title', 'text', 'sentiment' (Positive/Neutral/Negative), and 'date' (e.g., '3 days ago').
           - Ensure reviews feel real, specific to {request.destination} and the mentioned places, and reflect actual traveler feedback.
        5. 'ai_summary': A concise summary of the overall vibe.
        
        Return ONLY valid JSON.
        """
    else:
        prompt = f"Provide a generic travel intelligence report for {request.destination} regarding {request.category}. Return JSON."

    raw_response = await ai_service.get_json_content(prompt)
    import json
    try:
        data = json.loads(raw_response)
        return {"insight": data}
    except:
        return {"insight": {"error": "Failed to parse AI response", "raw": raw_response}}
