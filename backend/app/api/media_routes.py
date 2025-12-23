from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services.youtube_service import youtube_service
from app.auth.auth_utils import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

class VideoSearchRequest(BaseModel):
    query: str

@router.post("/videos")
async def search_videos(request: VideoSearchRequest):
    """
    Search for YouTube videos based on a query (e.g., 'Kyoto 4k walking tour').
    """
    results = youtube_service.search_videos(request.query)
    
    if isinstance(results, dict) and "error" in results:
        # Fallback logic or error reporting
        # For now, return empty or the error, but frontend handles empty gracefully
        print(f"YouTube Search Error: {results['error']}")
        return {"videos": []} # Return empty list on error to prevent frontend crash
        
    return {"videos": results}
