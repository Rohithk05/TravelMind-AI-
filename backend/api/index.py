
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

error_details = None

try:
    from app.main import app
except Exception as e:
    # Capture the error to display it
    error_details = {
        "message": str(e),
        "traceback": traceback.format_exc()
    }
    
    app = FastAPI()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path_name: str):
         return JSONResponse(
            status_code=500,
            content={
                "status": "CRASHED",
                "error": "Backend crashed during startup import",
                "debug_info": error_details
            },
        )
