from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.features.extractor import FeatureExtractor
from app.utils.model_loader import model_loader
from app.utils.cache import cache
from app.middleware.auth import verify_api_key

router = APIRouter()

class OrderFeatures(BaseModel):
    amount: float
    currency: str
    paymentMode: str
    customer: Dict[str, Any]
    email: str
    phone: str

class ScoreResponse(BaseModel):
    riskScore: float
    confidence: float

@router.post("/score", response_model=ScoreResponse, dependencies=[Depends(verify_api_key)])
async def score_order(order: OrderFeatures):
    """
    Score an order for RTO risk
    """
    try:
        # Check cache first
        order_id = f"{order.email}_{order.phone}_{order.amount}"
        cached = cache.get(f"score:{order_id}")
        if cached:
            return ScoreResponse(**cached)
        
        # Extract features
        extractor = FeatureExtractor()
        features = extractor.extract(order.dict())
        
        # Predict risk score
        risk_score = model_loader.predict(features)
        confidence = 0.8  # Placeholder confidence
        
        result = {
            "riskScore": risk_score,
            "confidence": confidence
        }
        
        # Cache result
        cache.set(f"score:{order_id}", result, ttl=3600)
        
        return ScoreResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scoring order: {str(e)}")

