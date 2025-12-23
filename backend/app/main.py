import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router
from app.database import init_db

app = FastAPI(
    title="TravelMind AI API",
    description="Backend for the TravelMind intelligent travel platform.",
    version="1.0.0"
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized successfully")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", ""), # Placeholder for production URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("VERCEL_ENV") else origins, # Allow all in Vercel or restricted to origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "active", "system": "TravelMind AI Core"}

from app.api.ai_routes import router as ai_router
from app.api.media_routes import router as media_router
from app.auth.auth_routes import router as auth_router

app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(media_router, prefix="/api/media", tags=["media"])
app.include_router(auth_router)

