"""
Feature store for caching and managing features
"""
from typing import Dict, Any, List
import redis
import json
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

class FeatureStore:
    """
    Store and retrieve features from Redis cache
    """
    
    def __init__(self):
        self.redis_client = redis.from_url(REDIS_URL) if REDIS_URL else None
    
    def get_features(self, order_id: str) -> Dict[str, float] | None:
        """
        Get cached features for an order
        """
        if not self.redis_client:
            return None
        
        try:
            cached = self.redis_client.get(f"features:{order_id}")
            if cached:
                return json.loads(cached)
        except Exception as e:
            print(f"Error getting features from cache: {e}")
        
        return None
    
    def set_features(self, order_id: str, features: Dict[str, float], ttl: int = 3600):
        """
        Cache features for an order
        """
        if not self.redis_client:
            return
        
        try:
            self.redis_client.setex(
                f"features:{order_id}",
                ttl,
                json.dumps(features)
            )
        except Exception as e:
            print(f"Error setting features in cache: {e}")

feature_store = FeatureStore()

