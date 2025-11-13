from fastapi import HTTPException, Header
from typing import Optional
import os

ML_API_KEY = os.getenv("ML_API_KEY", "")

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Verify API key for ML service endpoints
    """
    if not ML_API_KEY:
        return True  # Skip auth if no key is set
    
    if x_api_key != ML_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return True

